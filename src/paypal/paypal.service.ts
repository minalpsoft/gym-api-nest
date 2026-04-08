import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalService {
  private environment: paypal.core.SandboxEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    // this.environment = new paypal.core.SandboxEnvironment(
    //   'Ac8d_xBX4MzkSyzBHvO2-wTfQ7Gan5ErJRxIRCDK-KfZXtrqxC8td5lrOoWP3WJJMD1G1MRUO787P-zT',
    //   'EKpln3EmeYTydGXIkhuozDUoTcza5mdYXfly3GGystLoElVJ1z3uc9mxKpbXuqrZNpvs7yq5FJqI2nDN'
    // );

    // this.client = new paypal.core.PayPalHttpClient(this.environment);

    this.environment = new paypal.core.LiveEnvironment(
      'AQIyZiKMhSP0Cdo1D-2uWSIrQR2HVigkWlGJr7ND7SmyuaRMCH0I_k8q3jMImkBKQzBmjIHOADVqbULL',
      'EIfdwhhEbQpKb1anpd9gqHY-OewvLFS4e1OZP5WrDn2nvpTDhP2r74HGCEtaEOVmqTkbsO0HK1ewf0kh'
    );

    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  // async createOrder(amount: string) {
  //   const request = new paypal.orders.OrdersCreateRequest();

  //   request.prefer("return=representation");

  //   request.requestBody({
  //     intent: "CAPTURE",
  //     purchase_units: [
  //       {
  //         amount: {
  //           currency_code: "EUR",
  //           value: Number(amount).toFixed(2),
  //         },
  //       },
  //     ],
  //     application_context: {
  //       return_url: "fitness-gym://success",
  //       cancel_url: "fitness-gym://cancel",
  //       user_action: "PAY_NOW"
  //     },
  //     //     application_context: {
  //     //   return_url: "https://auth.expo.io/@minalpsoft/fitness-gym",
  //     //   cancel_url: "https://auth.expo.io/@minalpsoft/fitness-gym",
  //     //   user_action: "PAY_NOW"
  //     // }

  //   });

  //   const response = await this.client.execute(request);
  //   return response.result;
  // }

  async createOrder(amount: string) {
    try {
      console.log("========== PAYPAL CREATE ORDER START ==========");
      console.log("Incoming amount:", amount);
      console.log("Formatted amount:", Number(amount).toFixed(2));

      const request = new paypal.orders.OrdersCreateRequest();

      request.prefer("return=representation");

      const body = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: Number(amount).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: "fitness-gym://success",
          cancel_url: "fitness-gym://cancel",
          user_action: "PAY_NOW",
        },
      };

      console.log("PAYPAL CREATE ORDER REQUEST BODY:");
      console.log(JSON.stringify(body, null, 2));

      request.requestBody(body);

      const response = await this.client.execute(request);

      console.log("PAYPAL CREATE ORDER FULL RESPONSE:");
      console.log(JSON.stringify(response.result, null, 2));

      console.log(
        "ORDER ID:",
        response?.result?.id
      );

      console.log(
        "ORDER STATUS:",
        response?.result?.status
      );

      console.log(
        "ORDER CURRENCY:",
        response?.result?.purchase_units?.[0]?.amount?.currency_code
      );

      console.log(
        "ORDER VALUE:",
        response?.result?.purchase_units?.[0]?.amount?.value
      );

      const approveLink = response?.result?.links?.find(
        (link: any) => link.rel === "approve"
      )?.href;

      console.log("APPROVAL URL:", approveLink);

      console.log("========== PAYPAL CREATE ORDER END ==========");

      return response.result;
    } catch (error: any) {
      console.log("========== PAYPAL CREATE ORDER ERROR ==========");
      console.log("ERROR MESSAGE:", error?.message);
      console.log("ERROR STATUS CODE:", error?.statusCode);
      console.log("ERROR DETAILS:", JSON.stringify(error, null, 2));
      console.log("=============================================");
      throw error;
    }
  }

  async getOrder(orderId: string) {
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const response = await this.client.execute(request);
    return response.result;
  }

  // async captureOrder(orderId: string) {
  //   const request = new paypal.orders.OrdersCaptureRequest(orderId);
  //   request.requestBody({});
  //   const response = await this.client.execute(request);
  //   return response.result;
  // }
  async captureOrder(orderId: string) {
    try {
      console.log("========== PAYPAL CAPTURE START ==========");
      console.log("Incoming Order ID:", orderId);

      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const response = await this.client.execute(request);

      console.log("PAYPAL CAPTURE FULL RESPONSE:");
      console.log(JSON.stringify(response.result, null, 2));

      const orderStatus = response?.result?.status;
      const capture = response?.result?.purchase_units?.[0]?.payments?.captures?.[0];
      const captureStatus = capture?.status;
      const captureId = capture?.id;
      const captureCurrency = capture?.amount?.currency_code;
      const captureValue = capture?.amount?.value;
      const pendingReason = capture?.status_details?.reason || null;

      console.log("ORDER STATUS:", orderStatus);
      console.log("CAPTURE STATUS:", captureStatus);
      console.log("CAPTURE ID:", captureId);
      console.log("CAPTURE CURRENCY:", captureCurrency);
      console.log("CAPTURE VALUE:", captureValue);
      console.log("PENDING REASON:", pendingReason);

      console.log("========== PAYPAL CAPTURE END ==========");

      return {
        success: captureStatus === "COMPLETED",
        orderStatus,
        captureStatus,
        captureId,
        currency: captureCurrency,
        value: captureValue,
        pendingReason,
        raw: response.result,
      };
    } catch (error: any) {
      console.log("========== PAYPAL CAPTURE ERROR ==========");
      console.log("ERROR MESSAGE:", error?.message);
      console.log("ERROR STATUS CODE:", error?.statusCode);
      console.log("ERROR DETAILS:", JSON.stringify(error, null, 2));
      console.log("=========================================");

      throw error;
    }
  }

}
