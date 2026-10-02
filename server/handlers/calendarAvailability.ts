import { calendarAvailabilityHandler } from '../createApp';
import { runNodeHandler } from './http';

export function GET(request: Request) {
  return runNodeHandler(request, calendarAvailabilityHandler);
}
