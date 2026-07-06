const fs = require('fs');

const path = 'app/responsavel/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Imports
if (!content.includes('MapPickerModal')) {
  content = content.replace(
    "import { calculateDistanceKm, estimateTimeMinutes } from '../../../lib/utils/haversine';",
    "import { calculateDistanceKm, estimateTimeMinutes } from '../../../lib/utils/haversine';\nimport { geocodeAddress } from '../../../lib/utils/geocode';\nimport { MapPickerModal } from '../../../lib/components/MapPickerModal';"
  );
}

// 2. State & Handlers for each modal
const stateBlockCadastro = `  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocode = async () => {
    setIsGeocoding(true);
    const coords = await geocodeAddress(endereco);
    setIsGeocoding(false);
    if (coords) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lng.toString());
    } else {
      alert('Não foi possível encontrar as coordenadas para este endereço.');
    }
  };`;

const stateBlockEditar = `  const [endereco, setEndereco] = useState(aluno.endereco || '');
  const [latitude, setLatitude] = useState(aluno.latitude ? aluno.latitude.toString() : '');
  const [longitude, setLongitude] = useState(aluno.longitude ? aluno.longitude.toString() : '');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocode = async () => {
    setIsGeocoding(true);
    const coords = await geocodeAddress(endereco);
    setIsGeocoding(false);
    if (coords) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lng.toString());
    } else {
      alert('Não foi possível encontrar as coordenadas para este endereço.');
    }
  };`;

content = content.replace(/const \[endereco, setEndereco\] = useState\(''\);/g, stateBlockCadastro);
content = content.replace(/const \[endereco, setEndereco\] = useState\(aluno.endereco \|\| ''\);/g, stateBlockEditar);

// 3. Insert Payloads
content = content.replace(
  /escola_id: escolaIdAluno,/g,
  `escola_id: escolaIdAluno,
          latitude: latitude ? parseFloat(latitude.replace(',', '.')) : null,
          longitude: longitude ? parseFloat(longitude.replace(',', '.')) : null,`
);

// 4. UI changes
const uiBlock = `<div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Endereço Residencial do Aluno
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsMapModalOpen(true)} className="text-[9px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                      <MapPin size={10} /> Pegar no Mapa
                    </button>
                    <button type="button" onClick={handleGeocode} disabled={isGeocoding || !endereco.trim()} className="text-[9px] font-bold text-amber-500 hover:text-amber-600 disabled:opacity-50 transition-colors flex items-center gap-1">
                      {isGeocoding ? <span>Buscando...</span> : <><MapPin size={10} /> Auto-preencher</>}
                    </button>
                  </div>
                </div>`;

content = content.replace(
  /<label className="text-\[10px\] font-black text-slate-400 uppercase tracking-wider block mb-1">\s*Endereço Residencial do Aluno\s*<\/label>/g,
  uiBlock
);

// 5. Add Lat/Lng inputs below Address
const latLngInputs = `              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Latitude</label>
                  <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Ex: -23.4178" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Longitude</label>
                  <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Ex: -51.4269" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500" />
                </div>
              </div>`;

content = content.replace(
  /className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"\s*\/>/g,
  `className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"\n              />\n${latLngInputs}`
);

// Wait, the replace above would hit ANY input with that exact className.
// Let's refine the address input replace!
fs.writeFileSync('scratch/update_responsavel.js', content);
