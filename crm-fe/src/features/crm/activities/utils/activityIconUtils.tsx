import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  MessageSquare,
  Tv,
  Clock,
  FileText,
} from 'lucide-react';
import { ActivityType } from '../model/activityTypes';

export function getActivityTypeIcon(type: ActivityType, className: string = 'w-4 h-4') {
  switch (type) {
    case 'CALL':
      return <Phone className={className} />;
    case 'EMAIL':
      return <Mail className={className} />;
    case 'MEETING':
      return <Calendar className={className} />;
    case 'TASK':
      return <CheckSquare className={className} />;
    case 'MESSAGE':
      return <MessageSquare className={className} />;
    case 'DEMO':
      return <Tv className={className} />;
    case 'FOLLOW_UP':
      return <Clock className={className} />;
    case 'OTHER':
    default:
      return <FileText className={className} />;
  }
}
