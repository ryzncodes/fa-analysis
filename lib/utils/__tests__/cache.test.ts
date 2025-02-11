import fs from 'fs';
import { getCacheKey, getCachedData, invalidateCache, getCacheStats, TTL } from '../../cache';
import { memoryCache } from '../inMemoryCache';

jest.mock('fs');
jest.mock('../inMemoryCache');

describe('Cache Utils', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockMemoryCache = memoryCache as jest.Mocked<typeof memoryCache>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation();
  });

  describe('getCacheKey', () => {
    it('should generate correct cache key', () => {
      expect(getCacheKey('test', 'param1', 'param2')).toBe('test_param1_param2');
    });

    it('should handle single parameter', () => {
      expect(getCacheKey('test', 'param1')).toBe('test_param1');
    });
  });

  describe('getCachedData', () => {
    const mockData = { test: 'data' };
    const mockFetchFn = jest.fn().mockResolvedValue(mockData);
    const cacheKey = 'test_key';

    beforeEach(() => {
      mockMemoryCache.get.mockReturnValue(undefined);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        timestamp: Date.now(),
        data: mockData,
      }));
    });

    it('should return data from memory cache if available', async () => {
      mockMemoryCache.get.mockReturnValue(mockData);
      
      const result = await getCachedData(cacheKey, TTL.NEWS, mockFetchFn);
      
      expect(result).toBe(mockData);
      expect(mockFetchFn).not.toHaveBeenCalled();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it('should return data from file cache if memory cache misses', async () => {
      const result = await getCachedData(cacheKey, TTL.NEWS, mockFetchFn);
      
      expect(result).toEqual(mockData);
      expect(mockFetchFn).not.toHaveBeenCalled();
      expect(mockMemoryCache.set).toHaveBeenCalledWith(cacheKey, mockData, TTL.NEWS);
    });

    it('should fetch new data if cache is expired', async () => {
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        timestamp: Date.now() - TTL.NEWS - 1000, // Expired
        data: mockData,
      }));

      const result = await getCachedData(cacheKey, TTL.NEWS, mockFetchFn);
      
      expect(result).toEqual(mockData);
      expect(mockFetchFn).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(mockMemoryCache.set).toHaveBeenCalledWith(cacheKey, mockData, TTL.NEWS);
    });

    it('should handle cache read errors by fetching fresh data', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = await getCachedData(cacheKey, TTL.NEWS, mockFetchFn);
      
      expect(result).toEqual(mockData);
      expect(mockFetchFn).toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    const cacheKey = 'test_key';

    it('should remove cache from both memory and file', () => {
      invalidateCache(cacheKey);
      
      expect(mockMemoryCache.invalidate).toHaveBeenCalledWith(cacheKey);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining(cacheKey)
      );
    });

    it('should handle file deletion errors gracefully', () => {
      mockFs.unlinkSync.mockImplementation(() => {
        throw new Error('Delete error');
      });

      expect(() => invalidateCache(cacheKey)).not.toThrow();
    });
  });

  describe('getCacheStats', () => {
    it('should return combined stats from memory and file cache', () => {
      const mockMemoryStats = {
        hits: 10,
        misses: 5,
        size: 3,
        hitRate: 0.67,
        invalidations: 2,
      };
      mockMemoryCache.getStats.mockReturnValue(mockMemoryStats);
      
      // Mock fs.readdirSync to return an array of Dirent objects
      const mockDirents = ['file1', 'file2'].map(name => ({
        name,
        isFile: () => true,
        isDirectory: () => false,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isSymbolicLink: () => false,
        isFIFO: () => false,
        isSocket: () => false,
        path: '',
        parentPath: '',
      })) as fs.Dirent[];
      
      mockFs.readdirSync.mockReturnValue(mockDirents);

      const stats = getCacheStats();
      
      expect(stats).toEqual({
        memoryCache: mockMemoryStats,
        fileCache: {
          size: 2,
        },
      });
    });
  });
}); 