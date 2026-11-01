import React, { useState } from 'react';
import { SmartDevice, JarvisState } from '../types';
import { Lightbulb, Flame, Shield, Lock, Unlock, Plus, Power, CheckCircle, Sliders } from 'lucide-react';
import { playChime } from '../utils/speech';

interface SmartDeviceControlProps {
  state: JarvisState;
  onUpdateState: (newState: Partial<JarvisState>) => Promise<void>;
}

export const SmartDeviceControl: React.FC<SmartDeviceControlProps> = ({ state, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'light' | 'thermostat' | 'lock' | 'security'>('all');
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<SmartDevice['type']>('light');
  const [newDeviceRoom, setNewDeviceRoom] = useState('Living Room');

  const toggleDevice = async (id: string) => {
    playChime('affirm');
    const updated = state.devices.map((d) => {
      if (d.id === id) {
        return { ...d, status: !d.status };
      }
      return d;
    });
    await onUpdateState({ devices: updated });
  };

  const updateDeviceValue = async (id: string, val: number) => {
    const updated = state.devices.map((d) => {
      if (d.id === id) {
        return { ...d, value: val };
      }
      return d;
    });
    await onUpdateState({ devices: updated });
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    const newDev: SmartDevice = {
      id: `dev-${Date.now()}`,
      name: newDeviceName.trim(),
      type: newDeviceType,
      room: newDeviceRoom,
      status: true,
      value: newDeviceType === 'thermostat' ? 72 : newDeviceType === 'light' ? 80 : undefined
    };

    const updated = [...state.devices, newDev];
    await onUpdateState({ devices: updated });
    setNewDeviceName('');
    setIsAddingDevice(false);
    playChime('wake');
  };

  const filteredDevices = activeTab === 'all'
    ? state.devices
    : state.devices.filter((d) => d.type === activeTab);

  const lightsOnline = state.devices.filter((d) => d.type === 'light' && d.status).length;
  const securityArmed = state.devices.some((d) => d.type === 'security' && d.status);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Metrics */}
      <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>HOME AUTOMATION & IOT TELEMETRY MATRIX</span>
          </div>
          <h2 className="text-2xl font-bold text-cyan-100 font-sans tracking-wide">
            Smart Ecosystem Control
          </h2>
          <p className="text-sm text-cyan-300/70 mt-1">
            Manage lights, climate zones, perimeter security, and access locks in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-950/80 border border-cyan-900/60 rounded-2xl flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Security:</span>
            <span className="text-emerald-400 font-bold">{securityArmed ? 'ARMED' : 'DISARMED'}</span>
          </div>

          <div className="px-3.5 py-2 bg-slate-950/80 border border-cyan-900/60 rounded-2xl flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-300">Active Lights:</span>
            <span className="text-cyan-300 font-bold">{lightsOnline} / {state.devices.filter(d => d.type === 'light').length}</span>
          </div>

          <button
            onClick={() => setIsAddingDevice(!isAddingDevice)}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl font-mono text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Add Device Modal Form */}
      {isAddingDevice && (
        <form
          onSubmit={handleAddDevice}
          className="p-6 bg-slate-950/90 border border-cyan-500/40 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <h3 className="text-base font-bold text-cyan-200 font-mono flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Pair New IoT Device to Jarvis Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400/80 mb-1">Device Name</label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. Master Bedroom Chandelier"
                required
                className="w-full bg-slate-900 text-cyan-100 border border-cyan-900 rounded-xl px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400/80 mb-1">Device Category</label>
              <select
                value={newDeviceType}
                onChange={(e) => setNewDeviceType(e.target.value as any)}
                className="w-full bg-slate-900 text-cyan-100 border border-cyan-900 rounded-xl px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="light">Smart Lighting</option>
                <option value="thermostat">Climate Thermostat</option>
                <option value="lock">Biometric Lock</option>
                <option value="security">Perimeter Security</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400/80 mb-1">Assigned Room</label>
              <input
                type="text"
                value={newDeviceRoom}
                onChange={(e) => setNewDeviceRoom(e.target.value)}
                placeholder="e.g. Living Room, Workshop"
                required
                className="w-full bg-slate-900 text-cyan-100 border border-cyan-900 rounded-xl px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingDevice(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Confirm Pairing
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-cyan-950 pb-2 overflow-x-auto text-xs font-mono">
        {[
          { key: 'all', label: 'All Connected ( ' + state.devices.length + ' )' },
          { key: 'light', label: 'Lighting' },
          { key: 'thermostat', label: 'Climate' },
          { key: 'lock', label: 'Access Locks' },
          { key: 'security', label: 'Perimeter Defense' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-cyan-300 bg-slate-950/40 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((dev) => {
          const isLight = dev.type === 'light';
          const isThermo = dev.type === 'thermostat';
          const isLock = dev.type === 'lock';
          const isSec = dev.type === 'security';

          return (
            <div
              key={dev.id}
              className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
                dev.status
                  ? 'bg-slate-900/80 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-80'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                      dev.status
                        ? isLight
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : isThermo
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                          : isLock
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                          : 'bg-rose-500/20 text-rose-300 border-rose-400/50'
                        : 'bg-slate-900 text-slate-600 border-slate-800'
                    }`}
                  >
                    {isLight && <Lightbulb className="w-6 h-6" />}
                    {isThermo && <Flame className="w-6 h-6" />}
                    {isLock && (dev.status ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />)}
                    {isSec && <Shield className="w-6 h-6" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-cyan-100 text-base">{dev.name}</h4>
                    <span className="text-xs text-cyan-400/60 font-mono">{dev.room}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleDevice(dev.id)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    dev.status
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 hover:bg-cyan-500 hover:text-slate-950'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                  title="Toggle State"
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Status and Sliders */}
              {isLight && dev.status && (
                <div className="mt-4 pt-3 border-t border-cyan-950">
                  <div className="flex justify-between text-xs font-mono text-cyan-300 mb-1.5">
                    <span>Brightness</span>
                    <span>{dev.value || 80}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={dev.value || 80}
                    onChange={(e) => updateDeviceValue(dev.id, parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                  />
                </div>
              )}

              {isThermo && (
                <div className="mt-4 pt-3 border-t border-cyan-950">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-cyan-400/80">Target Temp</span>
                    <span className="text-2xl font-black font-mono text-cyan-100">{dev.value || 72}°F</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateDeviceValue(dev.id, (dev.value || 72) - 1)}
                      className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-cyan-900 text-cyan-300 rounded-lg font-mono text-sm"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="60"
                      max="85"
                      value={dev.value || 72}
                      onChange={(e) => updateDeviceValue(dev.id, parseInt(e.target.value, 10))}
                      className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                    />
                    <button
                      onClick={() => updateDeviceValue(dev.id, (dev.value || 72) + 1)}
                      className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-cyan-900 text-cyan-300 rounded-lg font-mono text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {isLock && (
                <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Lock Mechanism:</span>
                  <span className={`font-bold ${dev.status ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {dev.status ? 'SECURE & LOCKED' : 'UNLOCKED / OPEN'}
                  </span>
                </div>
              )}

              {isSec && (
                <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Perimeter Status:</span>
                  <span className={`font-bold flex items-center gap-1 ${dev.status ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {dev.status ? 'ARMED & MONITORING' : 'DISARMED'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
