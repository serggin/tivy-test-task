import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Paginator from "../components/Paginator";
import { formatDateTime, formatTags } from "../utils/formatters";

interface Event {
  id: number;
  title: string;
  date: string;
  category: string;
  web_tag_groups: string[];
  age: string;
}

interface FIltersProps {
  categories: string[];
  categorySelected: (category: string) => void;
  dates: string[];
  dateSelected: (date: string) => void;
  tags: string[];
  tagSelected: (tag: string) => void;
}

function Filters(props: FIltersProps) {
  return (
    <div className="filters">
      <div className="filter">
        <label htmlFor="categories">Category: </label>
        <select
          id="categories"
          disabled={props.categories.length < 2}
          onChange={(e) => props.categorySelected(e.target.value)}
        >
          <option value=""> </option>
          {props.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="filter">
        <label htmlFor="dates">Date: </label>
        <select
          id="dates"
          disabled={props.dates.length < 2}
          onChange={(e) => props.dateSelected(e.target.value)}
        >
          <option value=""> </option>
          {props.dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>
      <div className="filter">
        <label htmlFor="tags">Tag: </label>
        <select
          id="tags"
          disabled={props.tags.length < 2}
          onChange={(e) => props.tagSelected(e.target.value)}
        >
          <option value=""> </option>
          {props.tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { cityId } = useParams();
  const { state } = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const pageSize = 16;
  const [current, setCurrent] = useState(1);
  const navigate = useNavigate();
  const categories = useRef<string[]>([]);
  const dates = useRef<string[]>([]);
  const tags = useRef<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    fetch(`/api/events/${cityId}`)
      .then((res) => res.json())
      .then((data) => data as unknown as Event[])
      .then((data) => {
        setEvents(data);
        prepareFiltersData(data);
      });
  }, [cityId]);

  function prepareFiltersData(data: Event[]) {
    const _categories = data.reduce<string[]>((acc, cur) => {
      if (acc.includes(cur.category)) return acc;
      acc.push(cur.category);
      return acc;
    }, []);
    categories.current = _categories.sort();
    dates.current = data.reduce<string[]>((acc, cur) => {
      const date = cur.date.substring(0, 10);
      if (acc.includes(date)) return acc;
      acc.push(date);
      return acc;
    }, []);
    const _tags = data.reduce<string[]>((acc, cur) => {
      for (const tag of cur.web_tag_groups) {
        if (!acc.includes(tag)) acc.push(tag);
      }
      return acc;
    }, []);
    tags.current = _tags.sort();
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      return !(
        (selectedCategory && selectedCategory !== event.category) ||
        (selectedDate && selectedDate !== event.date.substring(0, 10)) ||
        (selectedTag && !event.web_tag_groups.includes(selectedTag))
      );
    });
  }, [events, selectedCategory, selectedDate, selectedTag]);

  const getData = () => {
    return filteredEvents.slice((current - 1) * pageSize, current * pageSize);
  };

  const categorySelected = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrent(1);
  }, []);

  const dateSelected = useCallback((date: string) => {
    setSelectedDate(date);
    setCurrent(1);
  }, []);

  const tagSelected = useCallback((tag: string) => {
    setSelectedTag(tag);
    setCurrent(1);
  }, []);

  const onClick = (id: number) => {
    navigate(`/event/${id}`);
  };

  const paginationChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  return (
    <div className="page">
      <h2>{state.name} Events</h2>
      <Filters
        categories={categories.current}
        categorySelected={categorySelected}
        dates={dates.current}
        dateSelected={dateSelected}
        tags={tags.current}
        tagSelected={tagSelected}
      />
      <Paginator
        total={filteredEvents.length}
        current={current}
        pageSize={pageSize}
        onChange={paginationChange}
      />
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Category</th>
            <th>Age</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {getData().map((data) => (
            <tr key={data.id} onClick={() => onClick(data.id)}>
              <td>{data.title}</td>
              <td>{formatDateTime(data.date)}</td>
              <td>{data.category}</td>
              <td>{data.age}</td>
              <td>{formatTags(data.web_tag_groups)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
