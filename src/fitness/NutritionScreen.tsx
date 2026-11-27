import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Search } from 'lucide-react';
import { formatNumber } from '../app/pt-BR';
import { Dialog, Empty, Title } from '../ui/primitives';
import { dayTotals, decimal, localDay, meals, nutrientNames, nutrients, nutritionFrom, portionGrams } from './model';
import type { Entry, Fitness, Food, FoodDetails, Nutrition } from './model';
import { searchFoods } from './openFoodFacts';

export type SaveFitness = (apply: (value: Fitness) => Fitness) => Promise<boolean>;

function NutritionInputs({ value }: { value?: Nutrition | null }) {
  return <div className="fitness-fields">{nutrients.map(key =>
    <label key={key}>{nutrientNames[key]} ({key === 'kcal' ? 'kcal' : 'g'})
      <input name={key} inputMode="decimal" required defaultValue={value?.[key]} />
    </label>
  )}</div>;
}

function NutritionGoals({ current, save, close }: { current: Nutrition | null; save: SaveFitness; close: () => void }) {
  const [error, setError] = useState('');
  return <Dialog title="Metas nutricionais" close={close}><form className="dialog-body form" onSubmit={async event => {
    event.preventDefault();
    const parsed = nutritionFrom(new FormData(event.currentTarget));
    if (!parsed.success) { setError('Informe valores numéricos válidos para as quatro metas.'); return; }
    if (await save(data => ({ ...data, targets: parsed.data }))) close();
  }}>
    <NutritionInputs value={current} />
    {error && <p className="error" role="alert">{error}</p>}
    <button className="button primary">Salvar metas</button>
    {current && <button type="button" className="text-button" onClick={async () => { if (await save(data => ({ ...data, targets: null }))) close(); }}>Remover metas</button>}
  </form></Dialog>;
}

function CustomFood({ save, select, close }: { save: SaveFitness; select: (value: FoodDetails) => void; close: () => void }) {
  const [id] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const nutrition = nutritionFrom(form);
    const servingText = String(form.get('serving') ?? '');
    const serving = servingText ? decimal(servingText) : null;
    if (!name || !nutrition.success || (serving !== null && !(serving > 0 && serving <= 20_000))) {
      setError('Informe nome, nutrientes por 100 g e uma porção válida, se desejar.');
      return;
    }
    const food: Food = { id, name, nutrition: nutrition.data, serving, source: { kind: 'manual' } };
    if (await save(value => ({ ...value, foods: [...value.foods.filter(item => item.id !== id), food] }))) select(food);
    else setError('O alimento ainda não foi salvo. Tente novamente.');
  }
  return <Dialog title="Alimento personalizado" close={close}><form className="dialog-body form" onSubmit={submit}>
    <label>Nome do alimento<input name="name" required maxLength={100} /></label>
    <p className="muted">Valores por 100 g</p><NutritionInputs />
    <label>Gramas por porção (opcional)<input name="serving" inputMode="decimal" /></label>
    {error && <p className="error" role="alert">{error}</p>}
    <button className="button primary">Salvar alimento</button>
  </form></Dialog>;
}

function EntryForm({ entry, date, foods, save, close }: { entry?: Entry; date: string; foods: Food[]; save: SaveFitness; close: () => void }) {
  const [id] = useState(() => entry?.id ?? crypto.randomUUID());
  const [food, choose] = useState<FoodDetails | null>(entry?.food ?? null);
  const [panel, setPanel] = useState<'entry' | 'custom'>('entry');
  const [unit, setUnit] = useState<'g' | 'serving'>('g');
  const [meal, setMeal] = useState<Entry['meal']>(entry?.meal ?? 'Almoço');
  const [amount, setAmount] = useState(entry?.grams.toString() ?? '');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchFoods>>>([]);
  const [searchState, setSearch] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  async function find(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch('loading');
    try { setResults(await searchFoods(query)); setSearch('ready'); }
    catch { setResults([]); setSearch('error'); }
  }
  async function readLabel(result: (typeof results)[number]) {
    setSearch('loading');
    try {
      const [resolved] = await searchFoods(result.barcode);
      setResults(items => items.map(item => item.barcode === result.barcode ? (resolved ?? { ...item, lookup: false }) : item));
      if (resolved?.food) select(resolved.food);
      setSearch('ready');
    } catch { setSearch('error'); }
  }
  function select(value: FoodDetails) {
    choose({ name: value.name, nutrition: value.nutrition, serving: value.serving, source: value.source });
    setUnit('g');
    setPanel('entry');
    setError('');
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mass = portionGrams(decimal(amount), unit, food?.serving ?? null);
    if (!food || !mass.success) { setError('Selecione um alimento e informe uma quantidade válida.'); return; }
    const value: Entry = { id, food, grams: mass.data, meal, date };
    if (await save(data => ({ ...data, entries: [...data.entries.filter(item => item.id !== id), value] }))) close();
    else setError('O registro ainda não foi salvo. Tente novamente.');
  }
  if (panel === 'custom') return <CustomFood save={save} select={select} close={() => setPanel('entry')} />;
  return <Dialog title={entry ? 'Editar registro' : 'Registrar alimento'} close={close}>
    <div className="dialog-body form">
      <div className="fitness-picker">
        {foods.length > 0 && <label>Meus alimentos<select value="" onChange={event => {
          const selected = foods.find(item => item.id === event.target.value);
          if (selected) select(selected);
        }}><option value="">Selecionar alimento</option>{foods.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
        <button className="text-button" type="button" onClick={() => setPanel('custom')}><Plus size={16} aria-hidden="true" />Alimento personalizado</button>
      </div>
      <form className="fitness-search" onSubmit={find}>
        <label>Nome ou código de barras<input required minLength={2} maxLength={80} value={query} onChange={event => setQuery(event.target.value)} /></label>
        <button className="button secondary" disabled={searchState === 'loading'}><Search size={16} aria-hidden="true" />Buscar</button>
      </form>
      <p className="muted fitness-source">Busca online por <a href="https://world.openfoodfacts.org/data" target="_blank" rel="noreferrer">Open Food Facts</a> (ODbL).</p>
      {searchState === 'loading' && <p role="status">Buscando produtos…</p>}
      {searchState === 'error' && <p role="alert" className="error">Busca indisponível. Tente mais tarde ou registre um alimento personalizado.</p>}
      {searchState === 'ready' && (results.length ? <ul className="fitness-results">{results.map(result => <li key={result.barcode}>
        {result.food
          ? <button type="button" className="list-row clickable" onClick={() => select(result.food!)}>{result.name} <small>{result.food.nutrition.kcal} kcal / 100 g</small></button>
          : result.lookup ? <button type="button" className="list-row clickable" onClick={() => { void readLabel(result); }}>{result.name} <small>Consultar rótulo</small></button> : <p>{result.name} <small>Rótulo incompleto. Use o registro manual.</small></p>}
      </li>)}</ul> : <p role="status">Nenhum produto encontrado.</p>)}
      <form className="form" onSubmit={submit}>
        <p aria-live="polite" className="selected-food">{food ? food.name : 'Selecione ou cadastre um alimento'}</p>
        <label>Refeição<select value={meal} onChange={event => setMeal(event.currentTarget.value as Entry['meal'])}>
          {meals.map(name => <option key={name}>{name}</option>)}
        </select></label>
        <div className="fitness-fields">
          <label>Quantidade<input inputMode="decimal" required value={amount} onChange={event => setAmount(event.target.value)} /></label>
          <label>Unidade<select value={unit} onChange={event => setUnit(event.currentTarget.value === 'serving' ? 'serving' : 'g')}>
            <option value="g">Gramas</option>
            {food?.serving && <option value="serving">Porções ({formatNumber(food.serving)} g)</option>}
          </select></label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button primary" disabled={!food}>Salvar registro</button>
      </form>
    </div>
  </Dialog>;
}

export function MacroTotals({ actual, targets }: { actual: Nutrition; targets: Nutrition | null }) {
  return <div className="macro-totals">{nutrients.map(key => <div key={key}>
    <span>{nutrientNames[key]}</span>
    <strong>{formatNumber(Number(actual[key].toFixed(1)))} <small>{key === 'kcal' ? 'kcal' : 'g'}</small></strong>
    {targets && <><small>Meta {formatNumber(targets[key])}</small>{targets[key] > 0 && <progress max={targets[key]} value={Math.min(actual[key], targets[key])} aria-label={nutrientNames[key] + ' em relação à meta'} />}</>}
  </div>)}</div>;
}

export function NutritionScreen({ data, save }: { data: Fitness; save: SaveFitness }) {
  const [date, setDate] = useState(localDay);
  const [dialog, setDialog] = useState<'goals' | 'entry' | Entry | null>(null);
  const list = data.entries.filter(item => item.date === date);
  const dates = [...new Set(data.entries.map(item => item.date))].sort().reverse();
  return <>
    <Title heading="Nutrição" subtitle="Diário alimentar" action={<button className="button primary" onClick={() => setDialog('entry')}><Plus size={17} aria-hidden="true" />Registrar alimento</button>} />
    <div className="fitness-day">
      <label>Data do diário<input type="date" value={date} max={localDay()} onChange={event => { if (event.target.value) setDate(event.target.value); }} /></label>
      <button className="text-button" onClick={() => setDialog('goals')}>Metas nutricionais</button>
    </div>
    <MacroTotals actual={dayTotals(list)} targets={data.targets} />
    {dates.length > 0 && <details className="fitness-history">
      <summary>Consultar histórico</summary>
      <label>Dias registrados<select value={dates.includes(date) ? date : ''} onChange={event => { if (event.target.value) setDate(event.target.value); }}>
        <option value="">Selecionar data</option>
        {dates.map(day => <option value={day} key={day}>{new Date(day + 'T12:00:00').toLocaleDateString('pt-BR')}</option>)}
      </select></label>
    </details>}
    <section className="fitness-ledger" aria-labelledby="refeicoes"><h2 id="refeicoes">Refeições</h2>
      {!list.length && <Empty title="Nenhum alimento registrado neste dia." />}
      {meals.map(meal => {
        const entries = list.filter(item => item.meal === meal);
        if (!entries.length) return null;
        return <section key={meal}><h3>{meal}</h3>{entries.map(item => <div className="fitness-food-row" key={item.id}>
          <div className="row-content"><strong>{item.food.name}</strong><small>{formatNumber(item.grams)} g · {Math.round(item.food.nutrition.kcal * item.grams / 100)} kcal{item.food.source.kind === 'off' && <> · <a href={'https://world.openfoodfacts.org/product/' + item.food.source.barcode} target="_blank" rel="noreferrer">Open Food Facts</a></>}</small></div>
          <button className="text-button" onClick={() => setDialog(item)} aria-label={'Editar ' + item.food.name}>Editar</button>
          <button className="text-button danger" onClick={() => { if (window.confirm('Excluir este registro?')) void save(value => ({ ...value, entries: value.entries.filter(row => row.id !== item.id) })); }} aria-label={'Excluir ' + item.food.name}>Excluir</button>
        </div>)}</section>;
      })}
    </section>
    {dialog === 'goals' && <NutritionGoals current={data.targets} save={save} close={() => setDialog(null)} />}
    {dialog && dialog !== 'goals' && <EntryForm entry={dialog === 'entry' ? undefined : dialog} date={date} foods={data.foods} save={save} close={() => setDialog(null)} />}
  </>;
}
