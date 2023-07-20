import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import sanitizeHtml from "sanitize-html";
import { formatDateTime } from "../utils/formatters";

interface Event {
  id: number;
  title: string;
  date: string;
  category: string;
  web_tag_groups: string[];
  age: string;
}
interface EventDetail extends Event {
  description: string;
  url: string;
  region: string;
  venue: string;
  address: string;
  min_price: number;
  max_price: number;
}

function Description({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}

export default function EventPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);

  useEffect(() => {
    fetch(`/api/event/${eventId}`)
      .then((res) => res.json())
      .then((data) => data as unknown as EventDetail)
      .then((data) => {
        setEvent(data);
      });
  }, [eventId]);

  if (!event) {
    return <div className="event-page">Loading ...</div>;
  }
  return (
    <div className="event-page">
      <h2 className="event-title">
        <div>{formatDateTime(event.date)}</div>
        <div>{event.title}</div>
      </h2>
      <Description html={event.description} />
      <div>
        <a href="{event.url}">{event.url}</a>
      </div>
      <div className="event-details">
        <div className="event-location">
          <div>{event.region}</div>
          <div>{event.venue}</div>
          <div>{event.address}</div>
          <div>
            Tickets from {event.min_price} to {event.max_price}
          </div>
        </div>
        <div className="events-extra">
          <div>
            <label>Age:</label> {event.age}
          </div>
          <div>
            <label>Category:</label> {event.category}
          </div>
          <div>
            <label>Tags:</label>
            <ul>
              {event.web_tag_groups.map((tag) => (
                <li>{tag}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
