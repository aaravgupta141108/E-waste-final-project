import React, { useState } from 'react';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  FileCheck,
  Cpu,
  RefreshCw,
  Flame,
  Award,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { DeviceItem, MaterialYield, OperatorIntervention, UserProfile } from '../types';

interface FactoryConsoleViewProps {
  devices: DeviceItem[];
  currentUser: UserProfile;
  onUpdateDeviceStatus: (deviceId: string, newStatus: DeviceItem['status'], extraData?: Partial<DeviceItem>) => void;
  onAddOperatorIntervention: (deviceId: string, intervention: OperatorIntervention) => void;
}

export const FactoryConsoleView: React.FC<FactoryConsoleViewProps> = ({
  devices,
  currentUser,
  onUpdateDeviceStatus,
  onAddOperatorIntervention
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[1]?.id || devices[0]?.id || '');
  const [factoryMeasuredWeight, setFactoryMeasuredWeight] = useState<string>('1.67');
  const [flagReasonText, setFlagReasonText] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);

  // Operator Intervention Input State
  const [interventionStation, setInterventionStation] = useState('Line 2 - Ultrasonic Component Disassembly');
  const [interventionType, setInterventionType] = useState<OperatorIntervention['actionType']>('Hazard Extraction');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [isHazardFlagged, setIsHazardFlagged] = useState(true);
  const [hazardTypeInput, setHazardTypeInput] = useState('Swollen Li-Polymer Battery Cell');

  // Material Yield breakdown inputs
  const [yieldCopper, setYieldCopper] = useState('28.5');
  const [yieldGold, setYieldGold] = useState('0.045');
  const [yieldAluminum, setYieldAluminum] = useState('110.0');
  const [yieldPlastic, setYieldPlastic] = useState('380.0');
  const [yieldGlass, setYieldGlass] = useState('210.0');
  const [yieldRareEarth, setYieldRareEarth] = useState('3.2');
  const [yieldResidue, setYieldResidue] = useState('12.5');

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  // Weight check calculation
  const intakeWeight = selectedDevice ? selectedDevice.intakeWeightKg : 0;
  const measuredWeight = parseFloat(factoryMeasuredWeight) || 0;
  const diffKg = Number((measuredWeight - intakeWeight).toFixed(3));
  const diffPct = intakeWeight > 0 ? Number(((diffKg / intakeWeight) * 100).toFixed(1)) : 0;
  const isWeightDiscrepancy = Math.abs(diffPct) > 10 || Math.abs(diffKg) > 0.1;

  // Add real-time operator intervention log
  const handleLogIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;

    const newIntervention: OperatorIntervention = {
      id: `INT-${Date.now().toString().slice(-6)}`,
      deviceId: selectedDevice.id,
      timestamp: new Date().toLocaleString(),
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      station: interventionStation,
      actionType: interventionType,
      notes: interventionNotes || 'Physical inspection and sub-assembly segregation performed.',
      hazardDetected: isHazardFlagged,
      hazardType: isHazardFlagged ? hazardTypeInput : undefined
    };

    onAddOperatorIntervention(selectedDevice.id, newIntervention);
    setInterventionNotes('');
    alert('Real-time Operator Intervention logged into immutable demanufacturing journal.');
  };

  // Flag device
  const handleFlagDevice = () => {
    if (!selectedDevice) return;
    onUpdateDeviceStatus(selectedDevice.id, 'FLAGGED', {
      flagReason: flagReasonText || `Weight mismatch: Factory ${measuredWeight}kg vs Intake ${intakeWeight}kg (${diffPct}%)`,
      flagNotes: `Flagged by Factory Engineer ${currentUser.name}. Recycling halted pending Master Admin review.`
    });
    setShowFlagModal(false);
    alert('Device marked FLAGGED. Escalated to statutory admin queue.');
  };

  // Accept checks
  const handleAcceptDevice = () => {
    if (!selectedDevice) return;
    if (isWeightDiscrepancy) {
      alert('Automatic Safety Alert: Weight discrepancy exceeds 10% threshold. You must flag this unit.');
      return;
    }
    onUpdateDeviceStatus(selectedDevice.id, 'ACCEPTED', {
      factoryWeightKg: measuredWeight,
      weightDiscrepancyPct: diffPct
    });
    alert('Authenticity and weight checks confirmed! Device routed to physical demanufacturing.');
  };

  // Finalize Recycling & Certify
  const handleCompleteRecycling = () => {
    if (!selectedDevice) return;

    const materialYield: MaterialYield = {
      copperGrams: parseFloat(yieldCopper) || 0,
      goldGrams: parseFloat(yieldGold) || 0,
      aluminumGrams: parseFloat(yieldAluminum) || 0,
      plasticGrams: parseFloat(yieldPlastic) || 0,
      glassGrams: parseFloat(yieldGlass) || 0,
      rareEarthGrams: parseFloat(yieldRareEarth) || 0,
      hazardousResidueGrams: parseFloat(yieldResidue) || 0
    };

    const certId = `CPCB-CERT-${selectedDevice.state.slice(0, 3).toUpperCase()}-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const certHash = `sha256-cert-${Math.random().toString(36).substring(2)}${Date.now().toString(16)}`;

    onUpdateDeviceStatus(selectedDevice.id, 'CERTIFIED', {
      materialYield,
      certificateId: certId,
      certificateHash: certHash,
      recyclerPartnerId: 'REC-UP-001',
      recyclerName: 'EcoRecycle Apex Solutions India Ltd.'
    });

    alert(`Demanufacturing complete! Certificate #${certId} generated and registered with CPCB portal.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/50 border border-cyan-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Factory className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Factory Demanufacturing & Refinery Console
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold uppercase">
                Plant Demount Line
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Plant Lead: {currentUser.name} • CPCB Facility: {currentUser.organization}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Incoming Lot Transit Queue:</span>
          <span className="text-sm font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/80 font-mono">
            {devices.filter((d) => d.status !== 'CERTIFIED').length} Units Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Device Transit Queue */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Factory Floor Assets
          </span>

          {devices.map((device) => {
            const isSelected = selectedDevice?.id === device.id;
            return (
              <div
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {device.brand} {device.model}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {device.category} • {device.batchId || 'Single Dispatch'}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      device.status === 'FLAGGED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : device.status === 'ACCEPTED'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    {device.status}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Intake: {device.intakeWeightKg} kg</span>
                  <span className="text-slate-300 font-mono text-[10px]">{device.id}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demanufacturing Inspection & Discrepancy Box */}
        {selectedDevice && (
          <div className="lg:col-span-8 space-y-6">
            {/* Authenticity & Weight Verification */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Intake Authenticity & Weight Discrepancy Check
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparing Collection Hub scale record against Factory Demanufacturing digital weighbridge.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  {selectedDevice.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <span className="text-slate-400 block text-[11px]">Intake Hub Scale Weight:</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {selectedDevice.intakeWeightKg} kg
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <span className="text-slate-400 block text-[11px]">Factory Scale Weight:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={factoryMeasuredWeight}
                    onChange={(e) => setFactoryMeasuredWeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono mt-1"
                  />
                </div>

                <div
                  className={`p-3 rounded-xl border font-mono text-xs ${
                    isWeightDiscrepancy
                      ? 'bg-rose-950/30 border-rose-600/50 text-rose-300'
                      : 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                  }`}
                >
                  <span className="block text-[11px] font-sans font-semibold">Weight Variance:</span>
                  <span className="text-base font-bold mt-1 block">
                    {diffKg >= 0 ? `+${diffKg}` : diffKg} kg ({diffPct}%)
                  </span>
                  <span className="text-[10px] block mt-0.5">
                    {isWeightDiscrepancy ? 'Exceeds 10% / 100g Threshold' : 'Within Tolerance (OK)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setShowFlagModal(true)}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 border border-rose-800/50 transition flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Flag Discrepancy & Halt Recycling</span>
                </button>

                <button
                  onClick={handleAcceptDevice}
                  disabled={isWeightDiscrepancy}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-bold text-white transition shadow flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pass Authenticity & Accept into Demount Line</span>
                </button>
              </div>
            </div>

            {/* Real-time Operator Intervention Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">
                    Real-time Operator Intervention Log
                  </h3>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold uppercase">
                  Safety Protocol G.S.R. 699(E)
                </span>
              </div>

              {/* Existing Interventions */}
              <div className="space-y-2">
                {selectedDevice.interventions && selectedDevice.interventions.length > 0 ? (
                  selectedDevice.interventions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-cyan-400 font-bold">{item.actionType}</span>
                        <span className="text-slate-400">{item.timestamp}</span>
                      </div>
                      <p className="text-slate-200">{item.notes}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Station: {item.station}</span>
                        <span>Logged by: {item.operatorName}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No manual interventions recorded yet for this asset.
                  </p>
                )}
              </div>

              {/* Add New Operator Intervention Form */}
              <form
                onSubmit={handleLogIntervention}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
              >
                <div className="text-xs font-bold text-white">Log Live Manual Intervention:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Station</label>
                    <input
                      type="text"
                      value={interventionStation}
                      onChange={(e) => setInterventionStation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Action Category</label>
                    <select
                      value={interventionType}
                      onChange={(e) => setInterventionType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="Hazard Extraction">Hazard Extraction (Swollen Li-ion / Hg Lamp)</option>
                      <option value="Component Segregation">PCB / Motherboard Gold Pins Harvest</option>
                      <option value="Manual Override">Manual Override / Chassis Shearing</option>
                      <option value="Weight Discrepancy Note">Weight Discrepancy Note</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Technical Engineering Observations
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Battery pouch isolated under Argon fume chamber without thermal runaway."
                    value={interventionNotes}
                    onChange={(e) => setInterventionNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={isHazardFlagged}
                      onChange={(e) => setIsHazardFlagged(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Flag Hazardous Waste Stream Entry</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Commit Log Entry</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Material Recovery Yields & Final Certification */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Refinery Material Extraction & Output Yields
                  </h3>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">
                  Zero Landfill Target
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-amber-400 block text-[10px] font-sans font-bold">Copper (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={yieldCopper}
                    onChange={(e) => setYieldCopper(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-yellow-400 block text-[10px] font-sans font-bold">Gold (g)</span>
                  <input
                    type="number"
                    step="0.001"
                    value={yieldGold}
                    onChange={(e) => setYieldGold(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-slate-300 block text-[10px] font-sans font-bold">Aluminum (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={yieldAluminum}
                    onChange={(e) => setYieldAluminum(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-cyan-400 block text-[10px] font-sans font-bold">Plastics (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={yieldPlastic}
                    onChange={(e) => setYieldPlastic(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCompleteRecycling}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Finalize Demanufacturing & Issue CPCB Green Certificate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">Flag Device & Halt Demanufacturing</h4>
            </div>
            <p className="text-xs text-slate-300">
              Provide mandatory notes for statutory auditor review:
            </p>
            <textarea
              rows={3}
              value={flagReasonText}
              onChange={(e) => setFlagReasonText(e.target.value)}
              placeholder="e.g. Weight mismatch of 16.2% detected. Casing missing heat pipe."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFlagModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagDevice}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-xs font-bold text-white"
              >
                Confirm Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
