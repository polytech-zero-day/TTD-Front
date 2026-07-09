import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { medalForRank, type LeaderboardEntry } from '../data/dummyLeaderboard';

interface RankingTableProps {
  entries: LeaderboardEntry[];
}

export default function RankingTable({ entries }: RankingTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="sticky top-0 bg-mirage text-left py-2.5 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
            순위
          </th>
          <th className="sticky top-0 bg-mirage text-left py-2.5 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
            닉네임
          </th>
          <th className="sticky top-0 bg-mirage text-right py-2.5 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
            품질
          </th>
          <th className="sticky top-0 bg-mirage text-right py-2.5 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
            효율
          </th>
          <th className="sticky top-0 bg-mirage text-right py-2.5 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
            시도
          </th>
          <th className="sticky top-0 bg-mirage text-right py-2.5 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
            토큰
          </th>
          <th className="sticky top-0 bg-mirage text-right py-2.5 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
            종합
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => {
          const medal = medalForRank(entry.rank);
          return (
            <tr
              key={entry.rank}
              className={`hover:bg-white/[0.02] ${
                entry.isCurrentUser ? 'bg-wedgewood/10' : ''
              }`}
            >
              <td className="py-[17px] px-3.5">
                <span className="flex items-center gap-1.5 font-bold text-[13.5px] text-gallery">
                  {medal && <span className="text-xs">{medal}</span>}
                  {entry.rank}
                </span>
              </td>
              <td className="py-3 px-3.5">
                <div className="flex items-center gap-2">
                  <Avatar initial={entry.name.charAt(0)} size="sm" />
                  <span className="text-[13.5px] text-gallery">{entry.name}</span>
                  {entry.isCurrentUser && <Badge tone="pill">나</Badge>}
                </div>
              </td>
              <td className="py-[17px] px-3.5 text-right text-[13.5px] text-gallery">
                {entry.quality}
              </td>
              <td className="py-[17px] px-3.5 text-right text-[13.5px] text-gallery">
                {entry.efficiency}
              </td>
              <td className="py-[17px] px-3.5 text-right text-[13.5px] text-gallery">
                {entry.attempts}
              </td>
              <td className="py-[17px] px-3.5 text-right text-[13.5px] text-gallery">
                {entry.tokens.toLocaleString()}
              </td>
              <td className="py-[17px] px-3.5 text-right text-[13.5px] font-bold text-gallery">
                {entry.total}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
