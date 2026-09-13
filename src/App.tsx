import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'

type Kategori = 'Reguler' | 'Ekspress' | 'Kilat' | 'Prioritas' | 'Darurat'
type Service = { id:string, nama:string, kategori:Kategori, durasi:string, harga:number, jenis:string, aktif:boolean }
type Order = { id:string, nama:string, kategori:Kategori, jenis:string, berat:number, total:number, status:string, created_at:string }

const OFFICIAL: Service[] = [
  {id:'r1', nama:'Reguler Cuci + Setrika', kategori:'Reguler', durasi:'48-72 JAM', harga:6980, jenis:'Cuci + Setrika', aktif:true},
  {id:'r2', nama:'Reguler Cuci Lipat', kategori:'Reguler', durasi:'48-72 JAM', harga:3980, jenis:'Cuci Lipat', aktif:true},
  {id:'r3', nama:'Reguler Setrika', kategori:'Reguler', durasi:'48-72 JAM', harga:4980, jenis:'Setrika', aktif:true},
  {id:'e1', nama:'Ekspress Cuci + Setrika', kategori:'Ekspress', durasi:'24-48 JAM', harga:8480, jenis:'Cuci + Setrika', aktif:true},
  {id:'e2', nama:'Ekspress Cuci Lipat', kategori:'Ekspress', durasi:'24-48 JAM', harga:5480, jenis:'Cuci Lipat', aktif:true},
  {id:'e3', nama:'Ekspress Setrika', kategori:'Ekspress', durasi:'24-48 JAM', harga:6480, jenis:'Setrika', aktif:true},
  {id:'k1', nama:'Kilat Cuci + Setrika', kategori:'Kilat', durasi:'12-24 JAM', harga:9730, jenis:'Cuci + Setrika', aktif:true},
  {id:'k2', nama:'Kilat Cuci Lipat', kategori:'Kilat', durasi:'12-24 JAM', harga:6730, jenis:'Cuci Lipat', aktif:true},
  {id:'k3', nama:'Kilat Setrika', kategori:'Kilat', durasi:'12-24 JAM', harga:7730, jenis:'Setrika', aktif:true},
  {id:'p1', nama:'Prioritas Cuci + Setrika', kategori:'Prioritas', durasi:'6-12 JAM', harga:10730, jenis:'Cuci + Setrika', aktif:true},
  {id:'p2', nama:'Prioritas Cuci Lipat', kategori:'Prioritas', durasi:'6-12 JAM', harga:7730, jenis:'Cuci Lipat', aktif:true},
  {id:'p3', nama:'Prioritas Setrika', kategori:'Prioritas', durasi:'6-12 JAM', harga:8730, jenis:'Setrika', aktif:true},
  {id:'d1', nama:'Darurat Cuci + Setrika', kategori:'Darurat', durasi:'3-6 JAM', harga:11580, jenis:'Cuci + Setrika', aktif:true},
  {id:'d2', nama:'Darurat Cuci Lipat', kategori:'Darurat', durasi:'3-6 JAM', harga:8580, jenis:'Cuci Lipat', aktif:true},
  {id:'d3', nama:'Darurat Setrika', kategori:'Darurat', durasi:'3-6 JAM', harga:9580, jenis:'Setrika', aktif:true},
]

const catColor: Record<string,string> = {
  Reguler:'bg-slate-100 text-slate-700 border-slate-300',
  Ekspress:'bg-blue-50 text-blue-700 border-blue-300',
  Kilat:'bg-amber-50 text-amber-700 border-amber-300',
  Prioritas:'bg-orange-50 text-orange-700 border-orange-300',
  Darurat:'bg-red-50 text-red-700 border-red-300'
}

export default function App(){
  const [view,setView]=useState<'customer'|'admin'|'os'>('customer')
  const [services,setServices]=useState<Service[]>(()=>{
    const s=localStorage.getItem('sultan_unified_services')
    return s? JSON.parse(s): OFFICIAL
  })
  const [orders,setOrders]=useState<Order[]>(()=>{
    const s=localStorage.getItem('sultan_unified_orders')
    return s? JSON.parse(s): []
  })
  const [selectedCat,setSelectedCat]=useState<string>('All')
  const [berat,setBerat]=useState(3)
  const [selectedService,setSelectedService]=useState<Service>(OFFICIAL[0])
  const [nama,setNama]=useState('Sultan')

  useEffect(()=>{ localStorage.setItem('sultan_unified_services', JSON.stringify(services))
    const ch=new BroadcastChannel('sultan_sync'); ch.postMessage({type:'services', data:services}); ch.close()
  },[services])
  useEffect(()=>{ localStorage.setItem('sultan_unified_orders', JSON.stringify(orders))
    const ch=new BroadcastChannel('sultan_sync'); ch.postMessage({type:'orders', data:orders}); ch.close()
  },[orders])
  useEffect(()=>{
    const ch=new BroadcastChannel('sultan_sync')
    ch.onmessage=(e)=>{ if(e.data.type==='services') setServices(e.data.data); if(e.data.type==='orders') setOrders(e.data.data) }
    return ()=>ch.close()
  },[])

  const filtered = selectedCat==='All'? services : services.filter(s=>s.kategori===selectedCat)

  const createOrder = ()=>{
    const total = selectedService.harga * berat
    const order:Order = {id:'SLT-'+Math.floor(1000+Math.random()*9000), nama, kategori:selectedService.kategori, jenis:selectedService.nama, berat, total, status:'Dijemput', created_at:new Date().toISOString()}
    setOrders([order, ...orders])
    if(supabase) supabase.from('orders').insert(order).then(()=>{})
    alert('Pesanan '+order.id+' dibuat! Rp'+total.toLocaleString('id-ID'))
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-20 flex justify-between items-center">
        <div><div className="font-black text-amber-400">THE SULTAN LAUNDRY</div><div className="text-[10px] opacity-70">Antar Jemput • 30m selatan Kantor Kec. Banguntapan</div></div>
        <div className="flex gap-2">
          {(['customer','admin','os'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${view===v?'bg-amber-400 text-slate-900':'bg-white/10'}`}>{v==='customer'?'👑 Customer':v==='admin'?'🛠️ Admin':'⚙️ OS'}</button>
          ))}
        </div>
      </header>

      {view==='customer' && (
        <div className="max-w-md mx-auto bg-white min-h-screen shadow">
          <div className="p-3 bg-amber-50 text-[11px] border-b">📍 Jln. Pertapan-Ngipik, Tegal Cerme Rt.08, Baturetno, Banguntapan, Bantul</div>
          <div className="p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All','Reguler','Ekspress','Kilat','Prioritas','Darurat'].map(c=>(
                <button key={c} onClick={()=>setSelectedCat(c)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs border ${selectedCat===c?'bg-slate-900 text-white':'bg-white'}`}>{c}</button>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {filtered.map(s=>(
                <div key={s.id} onClick={()=>setSelectedService(s)} className={`p-3 rounded-xl border-2 flex justify-between cursor-pointer ${selectedService.id===s.id?'border-amber-400 bg-amber-50':'border-slate-100'}`}>
                  <div><div className="font-bold text-sm">{s.nama}</div><div className={`text-[10px] px-2 py-0.5 rounded-full border inline-block mt-1 ${catColor[s.kategori]}`}>{s.kategori} • {s.durasi}</div></div>
                  <div className="text-right"><div className={`font-black ${s.harga===3980?'text-red-600':''}`}>Rp{s.harga.toLocaleString('id-ID')}</div><div className="text-[10px]">/kg</div></div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
              <div className="text-sm font-bold">Pesan: {selectedService.nama}</div>
              <input type="range" min={1} max={10} value={berat} onChange={e=>setBerat(+e.target.value)} className="w-full mt-2"/>
              <div className="flex justify-between text-xs"><span>{berat} kg</span><span className="font-bold">Total Rp{(selectedService.harga*berat).toLocaleString('id-ID')}</span></div>
              <input value={nama} onChange={e=>setNama(e.target.value)} placeholder="Nama" className="w-full mt-3 p-2 border rounded-lg text-sm"/>
              <button onClick={createOrder} className="w-full mt-3 bg-slate-900 text-white py-3 rounded-xl font-bold">Pesan Jemput Sekarang</button>
            </div>
            {orders[0] && <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm">📦 {orders[0].id} - {orders[0].status} - Rp{orders[0].total.toLocaleString('id-ID')}</div>}
            <div className="mt-4 text-[10px] text-center opacity-60">** Harga berlaku per 13 Juli 2024</div>
          </div>
        </div>
      )}

      {view==='admin' && (
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-xl font-bold">Live Orders • {orders.length} pesanan (Sinkron)</h2>
          <div className="mt-4 bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-sm"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">ID</th><th>Pelanggan</th><th>Kategori</th><th>Berat</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{orders.map(o=>(
              <tr key={o.id} className="border-b"><td className="p-3 font-mono">{o.id}</td><td className="p-3">{o.nama}</td><td className="p-3"><span className={`px-2 py-1 rounded-full text-xs border ${catColor[o.kategori]}`}>{o.kategori}</span></td><td className="p-3">{o.berat}kg</td><td className="p-3">Rp{o.total.toLocaleString('id-ID')}</td><td className="p-3"><select value={o.status} onChange={e=>setOrders(orders.map(x=>x.id===o.id?{...x,status:e.target.value}:x))} className="border rounded px-2 py-1 text-xs"><option>Dijemput</option><option>Dicuci</option><option>Disetrika</option><option>Diantar</option><option>Selesai</option></select></td></tr>
            ))}</tbody></table>
          </div>
        </div>
      )}

      {view==='os' && (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4">
            <h3 className="font-bold">Harga Resmi per 13 Juli 2024 - Edit Inline (Sinkron ke Customer & Admin)</h3>
            <div className="mt-4 space-y-6">
              {(['Reguler','Ekspress','Kilat','Prioritas','Darurat'] as Kategori[]).map(cat=>{
                const catServices = services.filter(s=>s.kategori===cat)
                return (
                  <div key={cat}>
                    <div className="bg-[#134e4a] text-white p-2 rounded-t-lg text-sm font-bold flex justify-between"><span>{cat} - {catServices[0]?.durasi}</span><span>{catServices.length} layanan</span></div>
                    <div className="grid grid-cols-3 border">
                      {catServices.map(s=>(
                        <div key={s.id} className="p-2 border text-center">
                          <div className="text-[10px]">{s.jenis}</div>
                          <input type="number" value={s.harga} onChange={e=>{
                            const v=+e.target.value
                            setServices(services.map(x=>x.id===s.id?{...x,harga:v}:x))
                          }} className={`w-full text-center font-bold border rounded mt-1 ${s.harga===3980?'text-red-600':''}`}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="font-bold text-sm">Sync Status - 100% Sinkron</h4>
              <div className="mt-2 text-xs space-y-1"><div>🟢 Services: {services.length} (6980 etc)</div><div>🟢 Orders: {orders.length}</div><div>🟢 BroadcastChannel: Active</div><div>{supabase?'🟢 Supabase: Connected':'🟡 Supabase: Set env to connect'}</div></div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs">** Harga berlaku per 13 Juli 2024<br/>Jln. Pertapan-Ngipik, Tegal Cerme Rt.08</div>
          </div>
        </div>
      )}
    </div>
  )
}
