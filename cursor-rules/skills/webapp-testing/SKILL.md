---
name: webapp-testing
description: Test web app UI using Browser MCP and Storybook
---

# Webapp Testing Skill

Use Browser MCP to test the web application.

## Storybook Testing

1. Ensure Storybook running: `npm run storybook`
2. Navigate: `browser_navigate` to `http://localhost:6006`
3. Take snapshot: `browser_snapshot` or `browser_take_screenshot`
4. Verify component states

## Web App Testing

1. Ensure dev server: `npm run dev`
2. Navigate: `browser_navigate` to `http://localhost:3000`
3. Interact: `browser_click`, `browser_type`
4. Verify: `browser_snapshot`, `browser_console_messages`

## Available Browser Tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_click` | Click element |
| `browser_type` | Type text |
| `browser_hover` | Hover over element |
| `browser_snapshot` | Get page state |
| `browser_take_screenshot` | Capture image |
| `browser_console_messages` | Check for errors |
| `browser_network_requests` | Debug API calls |
| `browser_resize` | Test responsive layouts |
| `browser_press_key` | Keyboard interactions |

## Testing Workflow

### 1. Component Testing (Storybook)

```
browser_navigate → http://localhost:6006
browser_snapshot → verify component renders
browser_click → interact with controls
browser_console_messages → check for errors
```

### 2. Integration Testing (Web App)

```
browser_navigate → http://localhost:3000
browser_type → fill forms
browser_click → submit/navigate
browser_network_requests → verify API calls
browser_snapshot → verify state changes
```

## Testing Checklist

- [ ] Component renders correctly
- [ ] No console errors
- [ ] Responsive at different sizes (`browser_resize`)
- [ ] Keyboard navigation works (`browser_press_key`)
- [ ] Loading/error states display properly
- [ ] Network requests succeed

## Common Issues

| Issue | Debug With |
|-------|------------|
| Blank page | `browser_console_messages` |
| API failures | `browser_network_requests` |
| Layout broken | `browser_take_screenshot` |
| Click not working | `browser_snapshot` to find selector |
