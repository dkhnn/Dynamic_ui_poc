import React, { useEffect, useState } from 'react';
import { getTasks } from './api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Widget = ({ config, onDelete }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const filters = {
          status: config.filter_status,
          priority: config.filter_priority
        };
        const data = await getTasks(filters);
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [config]);

  if (loading) return <div className="p-4 border rounded shadow bg-white h-64 flex items-center justify-center">Loading...</div>;

  const renderContent = () => {
    if (tasks.length === 0) return <div className="text-gray-500">No tasks found.</div>;

    if (config.type === 'table') {
      return (
        <div className="overflow-auto h-full">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Title</th>
                <th className="p-2">Status</th>
                <th className="p-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="p-2">{t.id}</td>
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">{t.status}</td>
                  <td className="p-2">{t.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (config.type === 'bar') {
        // Group by Status for Bar chart
        const data = tasks.reduce((acc, curr) => {
            const existing = acc.find(x => x.name === curr.status);
            if (existing) existing.count++;
            else acc.push({ name: curr.status, count: 1 });
            return acc;
        }, []);

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (config.type === 'pie') {
        // Group by Priority for Pie chart
         const data = tasks.reduce((acc, curr) => {
            const existing = acc.find(x => x.name === curr.priority);
            if (existing) existing.value++;
            else acc.push({ name: curr.priority, value: 1 });
            return acc;
        }, []);

        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    return <div>Unknown widget type</div>;
  };

  const title = `${config.type.toUpperCase()} - ${config.filter_status ? `Status: ${config.filter_status}` : ''} ${config.filter_priority ? `Priority: ${config.filter_priority}` : ''}`;

  return (
    <div className="p-4 border rounded shadow bg-white h-80 flex flex-col relative">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
      >
        X
      </button>
      <h3 className="font-bold mb-2 text-gray-700 capitalize">
          {title || "All Tasks"}
      </h3>
      <div className="flex-1 min-h-0">
          {renderContent()}
      </div>
    </div>
  );
};

export default Widget;
