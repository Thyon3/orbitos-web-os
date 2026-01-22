import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Upload, 
  Search, 
  Filter, 
  Heart, 
  Download, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  SkipForward,
  RefreshCw,
  Grid3x3,
  List,
  Settings
} from 'lucide-react';
import { useWallpaper } from '@/context/WallpaperContext';

export default function WallpaperManager() {
  const {
    wallpapers,
    activeWallpaper,
    loading,
    stats,
    slideshow,
    loadWallpapers,
    activateWallpaper,
    deleteWallpaper,
    toggleFavorite,
    loadStats,
    startSlideshow,
    stopSlideshow,
    nextWallpaper,
  } = useWallpaper();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedView, setSelectedView] = useState('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedWallpapers, setSelectedWallpapers] = useState([]);

  useEffect(() => {
    loadWallpapers();
    loadStats();
  }, [loadWallpapers, loadStats]);

  // Filter wallpapers
  const filteredWallpapers = wallpapers.filter((wallpaper) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      wallpaper.name?.toLowerCase().includes(query) ||
      wallpaper.description?.toLowerCase().includes(query) ||
      wallpaper.tags?.some(tag => tag.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === 'all' || wallpaper.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || wallpaper.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const handleActivateWallpaper = async (wallpaperId) => {
    try {
      await activateWallpaper(wallpaperId);
    } catch (error) {
      console.error('Failed to activate wallpaper:', error);
    }
  };

  const handleDeleteWallpaper = async (wallpaperId) => {
    if (confirm('Delete this wallpaper? This action cannot be undone.')) {
      try {
        await deleteWallpaper(wallpaperId);
        loadStats(); // Refresh stats after deletion
      } catch (error) {
        console.error('Failed to delete wallpaper:', error);
      }
    }
  };

  const handleToggleFavorite = async (wallpaperId) => {
    try {
      await toggleFavorite(wallpaperId);
      loadStats(); // Refresh stats after favorite change
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleToggleSlideshow = () => {
    if (slideshow.enabled) {
      stopSlideshow();
    } else {
      startSlideshow({
        category: selectedCategory,
        interval: 30, // 30 minutes
        shuffle: true,
      });
    }
  };

  const handleNextWallpaper = async () => {
    try {
      await nextWallpaper();
    } catch (error) {
      console.error('Failed to skip to next wallpaper:', error);
    }
  };

  const toggleWallpaperSelection = (wallpaperId) => {
    setSelectedWallpapers(prev =>
      prev.includes(wallpaperId)
        ? prev.filter(id => id !== wallpaperId)
        : [...prev, wallpaperId]
    );
  };

  const clearSelection = () => {
    setSelectedWallpapers([]);
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📂' },
    { value: 'nature', label: 'Nature', icon: '🌿' },
    { value: 'abstract', label: 'Abstract', icon: '🎨' },
    { value: 'minimal', label: 'Minimal', icon: '⚪' },
    { value: 'space', label: 'Space', icon: '🌌' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'art', label: 'Art', icon: '🖼️' },
    { value: 'photography', label: 'Photography', icon: '📸' },
    { value: 'patterns', label: 'Patterns', icon: '🔲' },
    { value: 'solid', label: 'Solid Colors', icon: '🎨' },
    { value: 'custom', label: 'Custom', icon: '⭐' },
  ];

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : '📂';
  };

  if (loading && wallpapers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Image className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading wallpapers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image className="w-6 h-6 text-purple-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Wallpaper Manager
              </h1>
              <p className="text-sm text-gray-500">
                {filteredWallpapers.length} wallpapers
                {stats && (
                  <span className="ml-2">
                    • {stats.favorites} favorites • {stats.formattedTotalSize}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setSelectedView('grid')}
                className={`p-2 ${
                  selectedView === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedView('list')}
                className={`p-2 ${
                  selectedView === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Slideshow Controls */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
              <button
                onClick={handleToggleSlideshow}
                className={`p-2 ${
                  slideshow.enabled 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={slideshow.enabled ? 'Stop Slideshow' : 'Start Slideshow'}
              >
                {slideshow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={handleNextWallpaper}
                disabled={!slideshow.enabled}
                className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Wallpaper"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                loadWallpapers();
                loadStats();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wallpapers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
              <option value="viewCount">Most Viewed</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Favorites only</span>
            </label>

            {searchQuery && (
              <span className="text-sm text-gray-500">
                {filteredWallpapers.length} result{filteredWallpapers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Selection Actions */}
          {selectedWallpapers.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedWallpapers.length} wallpaper{selectedWallpapers.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredWallpapers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            {searchQuery ? (
              <>
                <Search className="w-24 h-24 mb-4" />
                <p className="text-lg">No wallpapers found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <Image className="w-24 h-24 mb-4" />
                <p className="text-lg">No wallpapers</p>
                <p className="text-sm">Upload your first wallpaper to get started</p>
              </>
            )}
          </div>
        ) : selectedView === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredWallpapers.map((wallpaper) => (
              <div
                key={wallpaper._id}
                className={`group relative bg-gray-100 rounded-lg overflow-hidden aspect-video cursor-pointer transition-all hover:shadow-lg ${
                  wallpaper.isActive ? 'ring-2 ring-purple-500' : ''
                } ${
                  selectedWallpapers.includes(wallpaper._id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleActivateWallpaper(wallpaper._id)}
              >
                <img
                  src={wallpaper.url}
                  alt={wallpaper.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWallpaperSelection(wallpaper._id);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        selectedWallpapers.includes(wallpaper._id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(wallpaper._id);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        wallpaper.isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${wallpaper.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWallpaper(wallpaper._id);
                      }}
                      className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <p className="text-white text-xs font-medium truncate">
                    {wallpaper.name}
                  </p>
                  <div className="flex items-center justify-between text-white text-xs">
                    <span>{getCategoryIcon(wallpaper.category)}</span>
                    <span>{wallpaper.resolution}</span>
                  </div>
                </div>

                {/* Active Indicator */}
                {wallpaper.isActive && (
                  <div className="absolute top-2 left-2">
                    <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                      Active
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {filteredWallpapers.map((wallpaper) => (
              <div
                key={wallpaper._id}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                  wallpaper.isActive ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                } ${
                  selectedWallpapers.includes(wallpaper._id) ? 'border-blue-300 bg-blue-50' : ''
                }`}
                onClick={() => handleActivateWallpaper(wallpaper._id)}
              >
                <img
                  src={wallpaper.url}
                  alt={wallpaper.name}
                  className="w-20 h-12 object-cover rounded"
                  loading="lazy"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {wallpaper.name}
                    </h3>
                    {wallpaper.isActive && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                        Active
                      </span>
                    )}
                    {wallpaper.isFavorite && (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {wallpaper.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{getCategoryIcon(wallpaper.category)} {wallpaper.category}</span>
                    <span>{wallpaper.resolution}</span>
                    <span>{wallpaper.formattedSize}</span>
                    <span>{wallpaper.viewCount || 0} views</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWallpaperSelection(wallpaper._id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedWallpapers.includes(wallpaper._id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(wallpaper._id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      wallpaper.isFavorite
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${wallpaper.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWallpaper(wallpaper._id);
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}