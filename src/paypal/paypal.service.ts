import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalService {
  private environment: paypal.core.SandboxEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    // this.environment = new paypal.core.SandboxEnvironment(
    //   'AXLJ3dGmvZw7tYHomNMPTtI9fIyQqKkjb7GDnGZ5jqRCsfioR4rBUq2MkXk8JrxV011nBFtzMjSzn7vB',
    //   'EPv9EU8dcY7o0758MotsYo3i1r6uWssvMBY_nolwogEKArXVsnu9AOxsm3Mf0WTir1ILG6vKw9sZOvOf'
    // );

    // this.client = new paypal.core.PayPalHttpClient(this.environment);

      this.environment = new paypal.core.LiveEnvironment(
      'AQIyZiKMhSP0Cdo1D-2uWSIrQR2HVigkWlGJr7ND7SmyuaRMCH0I_k8q3jMImkBKQzBmjIHOADVqbULL',
      'EIfdwhhEbQpKb1anpd9gqHY-OewvLFS4e1OZP5WrDn2nvpTDhP2r74HGCEtaEOVmqTkbsO0HK1ewf0kh'
    );

    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createOrder(amount: string) {
    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: amount,
          },
        },
      ],
      application_context: {
        return_url: "fitness-gym://success",
        cancel_url: "fitness-gym://cancel",
        user_action: "PAY_NOW"
      },
      //     application_context: {
      //   return_url: "https://auth.expo.io/@minalpsoft/fitness-gym",
      //   cancel_url: "https://auth.expo.io/@minalpsoft/fitness-gym",
      //   user_action: "PAY_NOW"
      // }

    });

    const response = await this.client.execute(request);
    return response.result;
  }


  async getOrder(orderId: string) {
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const response = await this.client.execute(request);
    return response.result;
  }

  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const response = await this.client.execute(request);
    return response.result;
  }


}
