/**
 * BLEManager — Web Bluetooth API Singleton
 * Manages connection to ESP32 GATT server and provides real-time vital data
 *
 * Service UUID: 12345678-1234-1234-1234-123456789abc
 * Characteristic UUID: abcd1234-ab12-cd34-ef56-123456789abc
 * Device Name Prefix: herboratech
 */

const BLEManager = (() => {
  // Configuration
  const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
  const CHAR_UUID = 'abcd1234-ab12-cd34-ef56-123456789abc';
  const DEVICE_NAME_PREFIX = 'HerboraTech';

  // State
  let _device = null;
  let _characteristic = null;
  let _connected = false;
  let _callbacks = [];
  let _lastData = null;
  let _connectionStartTime = null;

  /**
   * Connect to BLE device (Web Bluetooth API)
   */
  async function connect() {
    try {
      if (_connected) {
        console.log('Already connected');
        return true;
      }

      _connectionStartTime = Date.now();
      console.log('🔍 Scanning for HerboraTech Watch...');

      // Scan for device with name prefix filter
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: DEVICE_NAME_PREFIX }
        ],
        optionalServices: [SERVICE_UUID]
      });

      _device = device;
      console.log('✅ Device found:', device.name);

      // Connect to GATT server
      const server = await device.gatt.connect();
      console.log('📡 GATT Server connected');

      // Get service
      const service = await server.getPrimaryService(SERVICE_UUID);
      console.log('📌 Service found');

      // Get characteristic
      _characteristic = await service.getCharacteristic(CHAR_UUID);
      console.log('✨ Characteristic found');

      // Start notifications
      await _characteristic.startNotifications();
      console.log('📢 Notifications started');

      // Listen for notifications
      _characteristic.addEventListener('characteristicvaluechanged', _onNotification);

      _connected = true;
      console.log('✅ BLE connected successfully!');

      // Notify callbacks of connection
      _callbacks.forEach(cb => {
        try {
          cb(_lastData || getDefaultData());
        } catch (e) {
          console.warn('Callback error:', e);
        }
      });

      return true;
    } catch (error) {
      _connected = false;
      console.error('❌ BLE connection failed:', error);

      // Show user-friendly error
      if (error.name === 'NotFoundError') {
        showToast('No HerboraTech Watch found nearby', 'warning');
      } else if (error.name === 'SecurityError') {
        showToast('Bluetooth permission denied', 'error');
      } else if (error.name === 'NotSupportedError') {
        showToast('Web Bluetooth not supported on this device', 'error');
      } else {
        showToast('Failed to connect: ' + error.message, 'error');
      }

      return false;
    }
  }

  /**
   * Disconnect from BLE device
   */
  async function disconnect() {
    try {
      if (_characteristic) {
        await _characteristic.stopNotifications();
        _characteristic.removeEventListener('characteristicvaluechanged', _onNotification);
      }

      if (_device && _device.gatt) {
        await _device.gatt.disconnect();
      }

      _connected = false;
      _device = null;
      _characteristic = null;
      _connectionStartTime = null;
      _lastData = null;

      console.log('✅ BLE disconnected');
      showToast('Smartwatch disconnected', 'success');
      return true;
    } catch (error) {
      console.error('Error during disconnect:', error);
      return false;
    }
  }

  /**
   * Parse raw BLE string into a data object.
   * Supports JSON or CSV format: "hr,spo2,temp,steps"
   */
  function _parsePayload(raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      // CSV format from ESP32: "heartRate,spo2,temp,steps"
      const parts = raw.split(',');
      if (parts.length >= 4) {
        return {
          hr: parseInt(parts[0], 10) || 0,
          spo2: parseInt(parts[1], 10) || 0,
          temp: parseFloat(parts[2]) || 0,
          temperature: parseFloat(parts[2]) || 0,
          steps: parseInt(parts[3], 10) || 0
        };
      }
      return null;
    }
  }

  /**
   * Handle incoming BLE data
   */
  function _onNotification(event) {
    try {
      const value = event.target.value;
      const raw = new TextDecoder().decode(value);
      const data = _parsePayload(raw);

      if (!data) {
        console.warn('Unrecognised BLE payload:', raw);
        return;
      }

      // Normalise field names so downstream code can use either key
      if (data.temp != null && data.temperature == null) data.temperature = data.temp;
      if (data.temperature != null && data.temp == null) data.temp = data.temperature;

      // Add metadata
      data.source = 'ble';
      data.timestamp = new Date().toISOString();
      data.connectionDuration = _connectionStartTime ? (Date.now() - _connectionStartTime) / 1000 : 0;

      _lastData = data;

      console.log('📊 BLE Data:', data);

      // Inject into VitalsManager if available
      if (window.VitalsManager && typeof VitalsManager.injectBLE === 'function') {
        VitalsManager.injectBLE(data);
      }

      // Call registered callbacks
      _callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.warn('Callback error:', e);
        }
      });
    } catch (error) {
      console.error('Error parsing BLE data:', error);
    }
  }

  /**
   * Register callback for BLE data updates
   * Returns unsubscribe function
   */
  function onData(callback) {
    if (typeof callback !== 'function') {
      console.warn('onData callback must be a function');
      return () => {};
    }

    _callbacks.push(callback);

    // If already connected, send last data immediately
    if (_connected && _lastData) {
      setTimeout(() => callback(_lastData), 0);
    }

    // Return unsubscribe function
    return () => {
      _callbacks = _callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current connection status
   */
  function getStatus() {
    return {
      connected: _connected,
      deviceName: _device?.name || null,
      deviceId: _device?.id || null,
      timestamp: new Date().toISOString(),
      lastData: _lastData,
      connectionDuration: _connectionStartTime ? (Date.now() - _connectionStartTime) / 1000 : 0
    };
  }

  /**
   * Get default dummy data when not connected
   */
  function getDefaultData() {
    return {
      hr: '--',
      spo2: '--',
      temp: '--',
      steps: 0,
      source: 'none',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Attempt auto-connect if device was previously connected
   */
  async function autoConnect() {
    try {
      const devices = await navigator.bluetooth.getAvailableDevices();
      const herboratechDevice = devices.find(d => d.gatt);

      if (herboratechDevice) {
        console.log('Auto-connecting to:', herboratechDevice.name);
        _device = herboratechDevice;
        const server = await herboratechDevice.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        _characteristic = await service.getCharacteristic(CHAR_UUID);
        await _characteristic.startNotifications();
        _characteristic.addEventListener('characteristicvaluechanged', _onNotification);
        _connected = true;
        return true;
      }
    } catch (error) {
      console.warn('Auto-connect failed:', error);
    }
    return false;
  }

  // Public API
  return {
    connect,
    disconnect,
    onData,
    getStatus,
    getDefaultData,
    autoConnect,
    get connected() { return _connected; },
    get device() { return _device; }
  };
})();

// Make BLEManager globally available
window.BLEManager = BLEManager;
