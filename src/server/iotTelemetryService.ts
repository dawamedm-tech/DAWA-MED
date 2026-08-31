/**
 * DAWA MED — Cold-Chain IoT & Driver Real Telemetry Ingestion Service
 * Handles IoT sensor events, Bluetooth/LoRa cold box data, and Live Driver GPS telemetry.
 */

import { FirestoreDataService } from './firestoreDb';

export interface ColdChainTelemetryPayload {
  orderId: string;
  sensorId: string;
  driverId?: string;
  temperatureCelsius: number;
  humidityPercent?: number;
  batteryPercent?: number;
  insulatedBoxSeal: 'SECURE_LOCKED' | 'OPENED' | 'TAMPER_ALERT';
  latitude: number;
  longitude: number;
  speedKmH?: number;
  timestamp?: string;
}

export class IotTelemetryService {
  private static instance: IotTelemetryService;
  private telemetryCache = new Map<string, ColdChainTelemetryPayload>();

  public static getInstance(): IotTelemetryService {
    if (!IotTelemetryService.instance) {
      IotTelemetryService.instance = new IotTelemetryService();
    }
    return IotTelemetryService.instance;
  }

  /**
   * Ingest and record IoT sensor measurement
   */
  public async ingestTelemetry(payload: ColdChainTelemetryPayload): Promise<{
    success: boolean;
    isCompliant: boolean;
    alertTriggered: boolean;
    alertMessage?: string;
  }> {
    const minTemp = 2.0;
    const maxTemp = 8.0;
    const isCompliant = payload.temperatureCelsius >= minTemp && payload.temperatureCelsius <= maxTemp;
    const isTampered = payload.insulatedBoxSeal === 'TAMPER_ALERT';
    const alertTriggered = !isCompliant || isTampered;

    let alertMessage: string | undefined;
    if (!isCompliant) {
      alertMessage = `CRITICAL COLD-CHAIN BREACH: Temperature is ${payload.temperatureCelsius.toFixed(1)}°C (Acceptable Range: 2.0°C – 8.0°C).`;
    } else if (isTampered) {
      alertMessage = `SECURITY ALERT: Insulated cold-box seal integrity compromised during transit.`;
    }

    const recorded = {
      ...payload,
      isCompliant,
      alertTriggered,
      alertMessage,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Cache latest reading in memory for ultra-fast tracking lookups
    this.telemetryCache.set(payload.orderId, recorded);

    // Persist to Cloud Firestore
    try {
      await FirestoreDataService.logTelemetry(recorded);
    } catch (e) {
      console.warn('[IoT Telemetry Firestore Warning]', e);
    }

    return {
      success: true,
      isCompliant,
      alertTriggered,
      alertMessage
    };
  }

  /**
   * Get active telemetry for an order
   */
  public async getOrderTelemetry(orderId: string): Promise<ColdChainTelemetryPayload | null> {
    if (this.telemetryCache.has(orderId)) {
      return this.telemetryCache.get(orderId)!;
    }

    try {
      const persisted = await FirestoreDataService.getLatestTelemetryForOrder(orderId);
      if (persisted) {
        this.telemetryCache.set(orderId, persisted);
        return persisted;
      }
    } catch (e) {
      console.warn('[Telemetry Query Warning]', e);
    }

    return null;
  }
}

export const iotTelemetryService = IotTelemetryService.getInstance();
