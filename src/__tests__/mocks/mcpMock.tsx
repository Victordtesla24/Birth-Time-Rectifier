// Mock MCP tools
global.window.useMcpTool = jest.fn().mockImplementation((serverName, toolName, args) => {
    switch (toolName) {
        case 'download_image':
            return Promise.resolve({
                success: true,
                path: `assets/textures/${args.url.split('/').pop()}`
            });
        case 'optimize_image':
            return Promise.resolve({
                success: true,
                path: args.path
            });
        case 'generate_animation':
            return Promise.resolve({
                success: true,
                path: args.outputPath,
                update: jest.fn(),
                draw: jest.fn()
            });
        case 'create_shader':
            return Promise.resolve({
                success: true,
                path: args.outputPath,
                setUniform: jest.fn()
            });
        default:
            return Promise.reject(new Error(`Unknown tool: ${toolName}`));
    }
});

// Mock p5.js resizeCanvas
if (global.window.p5) {
    global.window.p5.prototype.resizeCanvas = jest.fn();
}

// Mock container removal
const originalRemoveChild = Element.prototype.removeChild;
Element.prototype.removeChild = function(child) {
    if (child && child.id === 'test-container') {
        child.remove();
        return child;
    }
    return originalRemoveChild.call(this, child);
};

// Export for direct imports
export const mcpMock = {
    useMcpTool: global.window.useMcpTool
};
