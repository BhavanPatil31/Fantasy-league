import { Player, Match } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell
} from 'recharts';

interface AnalyticsProps {
  players: Player[];
  matches: Match[];
}

export default function Analytics({ players, matches }: AnalyticsProps) {
  // 1. Prepare Line Chart Data (Performance over time)
  // We need to map match numbers to each player's rank scores in that match
  const matchHistory = [...matches].sort((a, b) => a.matchNumber - b.matchNumber);
  
  const lineChartData = matchHistory.map(m => {
    const dataPoint: any = { name: m.matchTitle || `M${m.matchNumber}` };
    m.scores.forEach(s => {
      dataPoint[s.playerName] = s.rankScore;
    });
    return dataPoint;
  });

  // 2. Prepare Bar Chart Data (Last Match comparison)
  const lastMatch = matches[0];
  const barChartData = lastMatch ? lastMatch.scores.sort((a, b) => b.rankScore - a.rankScore) : [];

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

  return (
    <div className="space-y-8">
      {/* Line Chart */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] -ml-32 -mt-32"></div>
        
        <h2 className="text-xl font-bold mb-2 flex items-center gap-3 relative">
          Performance Timeline
        </h2>
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-12 font-medium relative">Rank score distribution across season matches</p>

        <div className="h-[400px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b840" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b840" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '16px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
                itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
              {players.map((p, i) => (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={p.name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={4}
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Point Distribution Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
            Last Match Intensity
          </h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-10 font-medium">Rank scores from most recent contest</p>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="playerName" 
                  stroke="#94a3b840" 
                  fontSize={9} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b840" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(12px)'
                  }}
                />
                <Bar dataKey="rankScore" radius={[12, 12, 0, 0]} barSize={40}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Season Rewards</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between group">
              <span className="text-sm text-slate-300 font-medium">1st Place</span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold text-amber-400 border border-white/10">14 pts</span>
            </li>
            <li className="flex items-center justify-between group">
              <span className="text-sm text-slate-300 font-medium">2nd Place</span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold text-slate-100 border border-white/10">12 pts</span>
            </li>
            <li className="flex items-center justify-between group opacity-60">
              <span className="text-sm text-slate-300 font-medium">Final Rank</span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold text-slate-400 border border-white/10">0 pts</span>
            </li>
          </ul>
          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-slate-400 leading-relaxed italic font-medium">
              "The distance between second place and first place is greater than the distance between second and eighth."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
