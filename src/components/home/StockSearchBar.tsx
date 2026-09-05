import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { COMMON_MAKES, YEAR_OPTIONS } from '../../config/options';

/** Hero search bar. Submitting routes to /stock with filters as query params. */
export function StockSearchBar() {
  const navigate = useNavigate();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (make) p.set('make', make);
    if (model) p.set('model', model);
    if (yearMin) p.set('yearMin', yearMin);
    if (priceMax) p.set('priceMax', priceMax);
    navigate(`/stock?${p.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-xl border border-white/10 bg-brand-black/85 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-5"
      aria-label="Search stock"
    >
      <div>
        <label htmlFor="hero-make" className="field-label">Make</label>
        <select id="hero-make" value={make} onChange={(e) => setMake(e.target.value)} className="field-input">
          <option value="">Any make</option>
          {COMMON_MAKES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="hero-model" className="field-label">Model</label>
        <input
          id="hero-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. Corolla"
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="hero-year" className="field-label">Min year</label>
        <select id="hero-year" value={yearMin} onChange={(e) => setYearMin(e.target.value)} className="field-input">
          <option value="">Any</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="hero-price" className="field-label">Max price (€)</label>
        <select id="hero-price" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="field-input">
          <option value="">Any</option>
          {[10000, 15000, 20000, 25000, 30000, 40000, 50000].map((p) => (
            <option key={p} value={p}>€{p.toLocaleString('en-IE')}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <button type="submit" className="btn-primary h-[42px] w-full">
          <Search size={16} aria-hidden /> Search
        </button>
      </div>
    </form>
  );
}
