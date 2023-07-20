import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Paginator from "../components/Paginator";

interface City {
  id: number;
  name: string;
  events_count: number;
}

export default function Home() {
  const pageSize = 16;
  const [cities, setCities] = useState<City[]>([]);
  const [current, setCurrent] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => data as unknown as City[])
      .then(setCities);
  }, []);

  const getData = () => {
    return cities.slice((current - 1) * pageSize, current * pageSize);
  };

  const onClick = (id: number, name: string) => {
    console.log("clicked id=", id);
    navigate(`events/${id}`, { state: { name } });
  };

  const paginationChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  return (
    <div className="page">
      <h2>Cities</h2>
      <Paginator
        total={cities.length}
        current={current}
        pageSize={pageSize}
        onChange={paginationChange}
      />
      <table className="table">
        <thead>
          <tr>
            <th>City</th>
            <th>Events</th>
          </tr>
        </thead>
        <tbody>
          {getData().map((data) => (
            <tr key={data.id} onClick={() => onClick(data.id, data.name)}>
              <td>{data.name}</td>
              <td>{data.events_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
