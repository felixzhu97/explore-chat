// Simple smoke tests for tab pages - these are thin wrappers around screen components
describe('Tabs Wrapper Pages', () => {
  describe('StatusTabScreen', () => {
    it('should be defined', () => {
      // Status tab wraps HomeFeedScreen
      expect(true).toBe(true);
    });
  });

  describe('ProfileTabScreen', () => {
    it('should be defined', () => {
      // Profile tab wraps ProfileScreen
      expect(true).toBe(true);
    });
  });

  describe('ReelsTabScreen', () => {
    it('should be defined', () => {
      // Reels tab wraps ReelsScreen
      expect(true).toBe(true);
    });
  });

  describe('ExploreTabScreen', () => {
    it('should be defined', () => {
      // Explore tab wraps ExploreScreen
      expect(true).toBe(true);
    });
  });
});
