# Simple Dark Mode Chrome Extension

A lightweight Chrome extension that applies dark mode to any website.

## Features

- Apply dark mode to any website by injecting CSS
- Toggle dark mode ON/OFF from a popup
- Save user preferences using Chrome Storage API
- Whitelist feature to exclude specific websites

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your browser toolbar

## Usage

- Click the extension icon to open the popup
- Toggle the switch to enable/disable dark mode for the current website
- Click "Exclude This Website" to add the current site to the whitelist (dark mode will not be applied)
- Click "Include This Website" to remove the current site from the whitelist

## File Structure

- `manifest.json`: Extension configuration
- `popup.html`: User interface for the extension popup
- `popup.js`: JavaScript for the popup functionality
- `content.js`: Script injected into web pages to apply dark mode
- `background.js`: Background script for handling events
- `images/`: Directory containing icon files

## Customization

You can customize the dark mode styles by modifying the CSS in `content.js`.

## Notes

- The extension requires "storage" and "activeTab" permissions to function properly
- Dark mode is applied per-site, not globally
- Your preferences are saved and will persist even after browser restarts
