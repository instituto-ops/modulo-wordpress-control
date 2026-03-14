const fs = require('fs');
const path = require('path');

// Read the source file
const apiSource = fs.readFileSync(path.resolve(__dirname, '../../../public/js/api.js'), 'utf8');

// The file defines `const wpAPI = { ... }`. We can eval it in a context or extract it.
// Evaling it directly creates a local variable if we use `eval`.
// Let's create a global wpAPI by modifying the source slightly.
eval(apiSource.replace('const wpAPI', 'global.wpAPI'));

describe('wpAPI.fetchContent', () => {
  let originalApp;

  beforeEach(() => {
    // Mock the request method
    global.wpAPI.request = jest.fn();

    // Save window.app
    originalApp = window.app;

    // Create a mock app object
    window.app = {
      showLoadingTable: jest.fn()
    };
  });

  afterEach(() => {
    window.app = originalApp;
    jest.clearAllMocks();
  });

  test('should call showLoadingTable when type is not media', async () => {
    global.wpAPI.request.mockResolvedValue([]);
    await global.wpAPI.fetchContent('pages');
    expect(window.app.showLoadingTable).toHaveBeenCalled();
  });

  test('should NOT call showLoadingTable when type is media', async () => {
    global.wpAPI.request.mockResolvedValue([]);
    await global.wpAPI.fetchContent('media');
    expect(window.app.showLoadingTable).not.toHaveBeenCalled();
  });

  test('should use default values for type and full', async () => {
    global.wpAPI.request.mockResolvedValue([{id: 1, title: 'Test'}]);

    const result = await global.wpAPI.fetchContent();

    expect(global.wpAPI.request).toHaveBeenCalledWith(
      '/wp/pages?_fields=id,title,status,type&per_page=100&status=publish,draft'
    );
    expect(result).toEqual([{id: 1, title: 'Test'}]);
  });

  test('should request full fields when full is true', async () => {
    global.wpAPI.request.mockResolvedValue([]);

    await global.wpAPI.fetchContent('posts', true);

    expect(global.wpAPI.request).toHaveBeenCalledWith(
      '/wp/posts?_fields=id,title,status,type,content,featured_media&per_page=100&status=publish,draft'
    );
  });

  test('should handle and return empty array on error', async () => {
    global.wpAPI.request.mockRejectedValue(new Error('Network error'));

    const result = await global.wpAPI.fetchContent('pages');

    expect(result).toEqual([]);
  });
});
