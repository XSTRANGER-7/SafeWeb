# Logo Setup Instructions

## Adding the Logo Image

To add the government logo to the navbar:

1. **Save the logo image** to the `frontend/public/` directory
2. **Name it** `logo.png` (or update the path in `Navbar.jsx` if using a different name)
3. **Recommended size**: 48x48 pixels or larger (will be scaled to 48x48px in the navbar)

## Current Setup

The navbar is configured to look for the logo at `/logo.png` (which maps to `frontend/public/logo.png`).

If the logo image is not found, a placeholder with "SW" initials will be displayed instead.

## Supported Formats

- PNG (recommended for logos with transparency)
- JPG/JPEG
- SVG (scalable, best quality)

## Example

```
frontend/
  public/
    logo.png  ← Place your logo file here
```

After adding the logo, refresh your browser to see it in the navbar.

