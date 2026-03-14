describe("Media Library", () => {
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="media-list-container"></div>
      <div id="drop-zone"></div>
      <input type="file" id="media-upload-input" />
      <div id="media-editor-panel" style="display:none;"></div>
      <div id="editor-empty-state"></div>
      <div id="editor-active-state" style="display:none;">
        <button class="btn-primary">Salvar Otimização</button>
      </div>
      <img id="edit-panel-preview" />
      <input id="edit-panel-title" />
      <input id="edit-panel-alt" />
      <div id="edit-panel-usage"></div>
    `;

    // Mock the wpAPI
    window.wpAPI = {
      fetchMedia: jest.fn(),
      fetchContent: jest.fn(),
      updateMediaSEO: jest.fn(),
      updateMedia: jest.fn(),
      deleteMedia: jest.fn(),
      uploadMedia: jest.fn()
    };

    // Mock fetch for drafts
    global.fetch = jest.fn();

    // Require the media.js script
    require('../public/js/media.js');
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should show error UI when media fails to load", async () => {
    // Arrange
    window.wpAPI.fetchMedia.mockRejectedValue(new Error("API Error fetching media"));
    window.wpAPI.fetchContent.mockResolvedValue([]);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    await window.mediaLibrary.loadLibrary();

    // Assert
    // Verify console.error was called with our Error
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleErrorSpy.mock.calls[0][0].message).toBe("API Error fetching media");

    // Verify the error message UI is shown in the container
    const container = document.getElementById("media-list-container");
    expect(container.innerHTML).toContain('Erro ao carregar mídia.');

    consoleErrorSpy.mockRestore();
  });
});
