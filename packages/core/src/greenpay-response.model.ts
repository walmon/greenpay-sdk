export class GreenPayResponseModel {
  status: number;
  orderId?: string;
  requestId?: string;
  _signature?: string;
  description?: string;
  errors?: any[];
  body?: any;
}
