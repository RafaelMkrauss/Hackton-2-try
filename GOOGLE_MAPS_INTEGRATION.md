# Google Maps API Integration Guide

## Overview

This guide explains how to integrate Google Maps API with your BrasílIA Segura application for displaying reports on an interactive map and location picking.

## 🚀 Quick Setup

### 1. Get Google Maps API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select an existing one
3. **Enable APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. **Create Credentials**:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy your API key
5. **Secure your API key** (Important!):
   - Click on your API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domains: `localhost:*`, `your-domain.com/*`

### 2. Update Environment Variable

Replace `your-actual-google-maps-api-key-here` in your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC1example2key3here4actual5key6from7google
```

**Important**: Restart your development server after updating the environment variable!

```bash
# Stop the frontend server (Ctrl+C) and restart:
cd frontend
npm run dev
```

## 🗺️ Components Created

### 1. GoogleMapsProvider

**File**: `components/maps/GoogleMapsProvider.tsx`

- Loads Google Maps API with required libraries
- Handles loading states and errors
- Provides consistent API loading for all map components

### 2. ReportsMap

**File**: `components/maps/ReportsMap.tsx`

- Interactive map displaying all reports as markers
- Color-coded markers based on report status:
  - 🟡 Yellow: Pendente (Pending)
  - 🔵 Blue: Em Progresso (In Progress)
  - 🟢 Green: Resolvido (Resolved)
- Info windows with report details
- Click markers to view report information
- Optimized for performance with many reports

### 3. LocationPicker

**File**: `components/maps/LocationPicker.tsx`

- Interactive map for selecting locations
- Click anywhere on map to set location
- "Use my location" button for GPS
- Automatic reverse geocoding (coordinates → address)
- Used in report creation form

## 📍 Pages Updated

### 1. Map Page (`/map`)

- **File**: `app/map/page.tsx`
- Shows all reports on an interactive Google Map
- Sidebar with filters by status and category
- Report list with real-time filtering
- Click reports to highlight on map
- Click markers to view details

### 2. New Report Page (`/reports/new`)

- **File**: `app/reports/new/page.tsx`
- Integrated LocationPicker component
- Visual map for precise location selection
- Automatic address filling from coordinates
- Improved user experience

## 🔧 Features Implemented

### Map Features

- ✅ **Interactive pan and zoom**
- ✅ **Custom marker icons** (color-coded by status)
- ✅ **Info windows** with report details
- ✅ **Click events** for marker interaction
- ✅ **Responsive design** for mobile/desktop
- ✅ **Loading states** and error handling

### Location Features

- ✅ **Click-to-select** location on map
- ✅ **GPS location** with "Use my location" button
- ✅ **Reverse geocoding** (coordinates → address)
- ✅ **Address autocomplete** ready (Places API)
- ✅ **Real-time coordinate display**

### Data Integration

- ✅ **Report filtering** by status and category
- ✅ **Real-time data** from backend API
- ✅ **Report details** link from map
- ✅ **Location validation** for report creation

## 📱 Testing Your Integration

### 1. Test Map Page

1. Go to: http://localhost:3003/map
2. Login with: `user@hackaton.com` / `user123`
3. **Expected**: See interactive map with report markers
4. **Test**: Click markers to see info windows
5. **Test**: Use filters to show/hide reports

### 2. Test Report Creation

1. Go to: http://localhost:3003/reports/new
2. **Expected**: See map in location section
3. **Test**: Click on map to select location
4. **Test**: Click "Use my location" button
5. **Expected**: Address field auto-fills

### 3. Troubleshooting

#### Map not loading?

- ✅ Check API key in `.env.local`
- ✅ Verify APIs are enabled in Google Cloud Console
- ✅ Check browser console for errors
- ✅ Restart development server

#### "For development purposes only" watermark?

- ✅ This is normal for unrestricted API keys
- ✅ Add billing account to remove watermark
- ✅ Restrict API key to your domains

#### Location picker not working?

- ✅ Enable Geocoding API in Google Cloud Console
- ✅ Check browser location permissions
- ✅ Test in HTTPS environment (some browsers require HTTPS for geolocation)

## 🔒 Security Best Practices

### 1. API Key Restrictions

```bash
# In Google Cloud Console, restrict your API key to:
HTTP referrers (web sites):
- localhost:*
- *.yourdomain.com/*
- yourdomain.com/*
```

### 2. API Usage Limits

```bash
# Monitor usage in Google Cloud Console
# Set quotas to prevent unexpected charges:
- Maps JavaScript API: 28,000 requests/month (free tier)
- Geocoding API: 40,000 requests/month (free tier)
- Places API: Basic Data - no charge, Contact & Atmosphere Data - paid
```

### 3. Environment Variables

```bash
# Never commit API keys to version control
# Always use environment variables:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here

# Add to .gitignore:
.env.local
.env.production.local
```

## 🎨 Customization Options

### 1. Map Styling

Edit `components/maps/ReportsMap.tsx`:

```typescript
const mapOptions = {
  // Dark theme example:
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  ],
};
```

### 2. Custom Marker Icons

Edit marker icons in `getMarkerIcon()` function:

```typescript
const getMarkerIcon = (status: string) => {
  // Use custom images:
  return {
    url: "/images/markers/custom-marker.png",
    scaledSize: new google.maps.Size(32, 32),
  };
};
```

### 3. Additional Features to Add

#### Address Autocomplete

```typescript
// Add to LocationPicker component:
import { Autocomplete } from "@react-google-maps/api";

<Autocomplete>
  <input placeholder="Search for places..." />
</Autocomplete>;
```

#### Directions API

```typescript
// Add route planning between user and report:
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer();
```

#### Clustering for Performance

```typescript
// For apps with thousands of markers:
import { MarkerClusterer } from "@googlemaps/markerclusterer";
```

## 📊 API Usage Monitoring

Monitor your Google Maps API usage:

1. **Google Cloud Console** → **APIs & Services** → **Dashboard**
2. Set up **quota alerts** to avoid unexpected charges
3. Use **API restrictions** to limit usage to your domains only

## 🚀 Production Deployment

Before deploying to production:

1. **Update environment variables** in your hosting platform
2. **Add production domains** to API key restrictions
3. **Enable billing** in Google Cloud Console (required for production)
4. **Test all map features** in production environment
5. **Monitor API usage** and set up alerts

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all APIs are enabled in Google Cloud Console
3. Test with a fresh API key
4. Check the Google Maps JavaScript API documentation

Your Google Maps integration is now complete! 🎉
