# Google Maps API Setup Guide - Multi-Computer Setup

## 🚨 PROBLEMA IDENTIFICADO: "Mapa carregando" infinito
**Causa:** Google Cloud Console e VS Code rodando em computadores diferentes

## Current API Key
Your API key: `AIzaSyDyF2pOsvsXTXtr6YXivIwywYumYzP_aNc`

## 🔧 SOLUÇÃO RÁPIDA PARA MULTI-COMPUTER

### Opção 1: Remover Restrições Temporariamente (RECOMENDADO PARA TESTE)
1. Vá para [API Keys](https://console.cloud.google.com/apis/credentials)
2. Clique na sua API Key: `AIzaSyDyF2pOsvsXTXtr6YXivIwywYumYzP_aNc`
3. Em "Application restrictions" → Selecione **"None"**
4. Clique "Save"
5. Teste o mapa imediatamente

### Opção 2: Configurar HTTP Referrers Específicos
Em "Application restrictions" → "HTTP referrers", adicione:
```
localhost:3001/*
127.0.0.1:3001/*
*:3001/*
[SEU_IP_LOCAL]:3001/*
```

## Step-by-Step Google Cloud Console Configuration

### 1. Enable Required APIs
Go to [Google Cloud Console APIs](https://console.cloud.google.com/apis/dashboard) and enable these APIs:

1. **Maps JavaScript API** (Essential for map display)
   - Navigate to: APIs & Services → Library
   - Search for "Maps JavaScript API"
   - Click and press "ENABLE"

2. **Places API** (For location search and autocomplete)
   - Search for "Places API"
   - Click and press "ENABLE"

3. **Geocoding API** (For address conversion)
   - Search for "Geocoding API"
   - Click and press "ENABLE"

### 2. Configure API Key Restrictions
Go to [API Keys](https://console.cloud.google.com/apis/credentials):

1. Find your API key: `AIzaSyDyF2pOsvsXTXtr6YXivIwywYumYzP_aNc`
2. Click the pencil icon to edit
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add these referrers:
     ```
     http://localhost:3001/*
     https://localhost:3001/*
     http://127.0.0.1:3001/*
     https://127.0.0.1:3001/*
     ```
4. Under "API restrictions":
   - Select "Restrict key"
   - Choose these APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API

### 3. Enable Billing
**⚠️ CRITICAL: Google Maps requires billing to be enabled**

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Create a billing account if you don't have one
3. Link it to your project
4. **Note**: Google provides $200 free monthly credit for Maps APIs

### 4. Check Quotas
Go to [Quotas](https://console.cloud.google.com/iam-admin/quotas):
- Ensure you haven't exceeded daily limits
- Check Maps JavaScript API quota

## Test Your Setup

### Test 1: Direct HTML Test
Open in browser: `http://localhost:3001/api-key-test.html`

### Test 2: Complete Map Test
Open in browser: `http://localhost:3001/test-maps-complete.html`

### Test 3: React App Test
1. Start your app: `npm run dev` (in frontend folder)
2. Go to: `http://localhost:3001/map`
3. Check the debug panel for status

## Common Issues & Solutions

### "RefererNotAllowedMapError"
- Add your domain to HTTP referrers in API key settings
- Include both `http://` and `https://` versions

### "This page can't load Google Maps correctly"
- Billing not enabled → Enable billing in Google Cloud Console
- Daily quota exceeded → Check quotas page
- Wrong API key → Verify key is correct

### "REQUEST_DENIED"
- API not enabled → Enable Maps JavaScript API
- Key restrictions too strict → Check API restrictions

### "ZERO_RESULTS" or location issues
- Enable Places API and Geocoding API
- Check if APIs are properly restricted to your key

## Troubleshooting Commands

Run these in your browser console on any map page:

```javascript
// Check if Google Maps loaded
console.log('Google Maps loaded:', typeof google !== 'undefined');

// Check if Maps API is available
console.log('Maps API available:', typeof google?.maps !== 'undefined');

// Get any Google Maps errors
window.gm_authFailure = function() {
  console.error('Google Maps authentication failed!');
};
```

## Project Structure Check
Your project uses these Google Maps components:
- `WorkingReportsMap` - Displays reports on map
- `WorkingLocationPicker` - Allows location selection
- `GoogleMapsDebugger` - Shows real-time status

## Next Steps
1. ✅ Follow steps 1-4 above in Google Cloud Console
2. ✅ Test with the HTML test pages
3. ✅ Run your React app and check `/map` page
4. ✅ Check console for any remaining errors

## Support
If you still see "Ops! Algo deu errado" after following these steps:
1. Check browser console for specific error messages
2. Verify billing is enabled (most common issue)
3. Ensure all three APIs are enabled
4. Check API key referrer restrictions
