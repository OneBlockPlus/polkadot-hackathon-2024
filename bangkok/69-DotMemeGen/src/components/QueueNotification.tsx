import { notification } from "antd";
import { NotificationStatus } from "../types";

const queueNotification = ({
  header,
  message,
  duration = 5,
  status,
}: {
  status: NotificationStatus;
  message: string;
  header: string;
  duration?: number;
}) => {
  const args = {
    message: header,
    description: message,
    duration: duration,
  };

  // queues notifcation
  notification[status](args);
};

export default queueNotification;
