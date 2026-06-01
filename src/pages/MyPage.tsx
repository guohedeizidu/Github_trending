import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, Clock, Star, X, FolderInput } from 'lucide-react';
import { useFavoritesStore } from '../stores/useFavoritesStore';

type Tab = 'favorites' | 'history';

export function MyPage() {
  const [tab, setTab] = useState<Tab>('favorites');
  const [activeGroup, setActiveGroup] = useState('default');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [movingItem, setMovingItem] = useState<string | null>(null);

  const { groups, favorites, history, addGroup, removeGroup, renameGroup, removeFavorite, moveFavorite, clearHistory } = useFavoritesStore();

  const groupFavorites = favorites.filter((f) => f.groupId === activeGroup);

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    addGroup(newGroupName.trim());
    setNewGroupName('');
    setShowNewGroup(false);
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    renameGroup(id, editName.trim());
    setEditingGroup(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-5">
        <ArrowLeft className="w-4 h-4" /> 返回列表
      </Link>

      <div className="flex gap-4 border-b border-gray-200 mb-5">
        <button
          onClick={() => setTab('favorites')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === 'favorites' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Star className="w-4 h-4 inline mr-1" />收藏
        </button>
        <button
          onClick={() => setTab('history')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Clock className="w-4 h-4 inline mr-1" />足迹
        </button>
      </div>
      {tab === 'favorites' && (
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center">
                {editingGroup === g.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleRename(g.id); }} className="flex items-center gap-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xs border rounded px-2 py-1 w-20"
                      autoFocus
                    />
                    <button type="submit" className="text-xs text-blue-600">确定</button>
                    <button type="button" onClick={() => setEditingGroup(null)} className="text-xs text-gray-400">取消</button>
                  </form>
                ) : (
                  <button
                    onClick={() => setActiveGroup(g.id)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${activeGroup === g.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {g.name}
                  </button>
                )}
                {g.id !== 'default' && editingGroup !== g.id && activeGroup === g.id && (
                  <div className="flex items-center ml-1 gap-0.5">
                    <button onClick={() => { setEditingGroup(g.id); setEditName(g.name); }} className="p-0.5 text-gray-400 hover:text-gray-600">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => { removeGroup(g.id); setActiveGroup('default'); }} className="p-0.5 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {showNewGroup ? (
              <form onSubmit={(e) => { e.preventDefault(); handleAddGroup(); }} className="flex items-center gap-1">
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="分组名称"
                  className="text-xs border rounded px-2 py-1 w-20"
                  autoFocus
                />
                <button type="submit" className="text-xs text-blue-600">添加</button>
                <button type="button" onClick={() => setShowNewGroup(false)} className="text-xs text-gray-400">取消</button>
              </form>
            ) : (
              <button onClick={() => setShowNewGroup(true)} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {groupFavorites.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">暂无收藏</p>
          ) : (
            <div className="space-y-2">
              {groupFavorites.map((f) => (
                <div key={f.repo.fullName} className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg border border-gray-100">
                  <img src={f.repo.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                  <Link to={`/detail/${f.repo.owner}/${f.repo.name}`} className="flex-1 min-w-0 no-underline">
                    <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">{f.repo.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{f.repo.description || '暂无描述'}</p>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0 relative">
                    {groups.length > 1 && (
                      <div className="relative">
                        <button onClick={() => setMovingItem(movingItem === f.repo.fullName ? null : f.repo.fullName)} className="p-1 text-gray-300 hover:text-blue-500" title="移动到">
                          <FolderInput className="w-4 h-4" />
                        </button>
                        {movingItem === f.repo.fullName && (
                          <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
                            {groups.filter((g) => g.id !== activeGroup).map((g) => (
                              <button
                                key={g.id}
                                onClick={() => { moveFavorite(f.repo.fullName, activeGroup, g.id); setMovingItem(null); }}
                                className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                              >
                                {g.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button onClick={() => removeFavorite(f.repo.fullName, activeGroup)} className="p-1 text-gray-300 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {history.length > 0 && (
            <div className="flex justify-end mb-3">
              <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500">清空足迹</button>
            </div>
          )}
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">暂无浏览记录</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <Link
                  key={h.repo.fullName + h.visitedAt}
                  to={`/detail/${h.repo.owner}/${h.repo.name}`}
                  className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg border border-gray-100 no-underline"
                >
                  <img src={h.repo.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">{h.repo.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{h.repo.description || '暂无描述'}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">{new Date(h.visitedAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
