import { useState } from 'react';
import { Search, Mail, TrendingUp, Calendar } from 'lucide-react';
import Card from './ui/Card';
import { students } from '../../data/supervisorData';

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [progressFilter, setProgressFilter] = useState('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.researchTitle.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesProgress = true;
    if (progressFilter === 'low') matchesProgress = student.progress < 50;
    if (progressFilter === 'medium') matchesProgress = student.progress >= 50 && student.progress < 80;
    if (progressFilter === 'high') matchesProgress = student.progress >= 80;

    return matchesSearch && matchesProgress;
  });

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getProgressBg = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Student List</h1>
        <p className="text-gray-600 mt-1">Manage all students under your supervision</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by student name or research title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'low', 'medium', 'high'].map((filter) => (
            <button
              key={filter}
              onClick={() => setProgressFilter(filter)}
              className={`px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                progressFilter === filter
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {filter === 'all' && 'All'}
              {filter === 'low' && 'Low Progress'}
              {filter === 'medium' && 'Medium Progress'}
              {filter === 'high' && 'High Progress'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} hover>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {student.name.split(' ').map((n) => n[0]).join('')}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{student.researchTitle}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail size={14} />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>Last: {new Date(student.lastSubmissionDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className={getProgressColor(student.progress)} />
                  <span className={`text-2xl font-bold ${getProgressColor(student.progress)}`}>
                    {student.progress}%
                  </span>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressBg(student.progress)}`}
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredStudents.length}</span> of{' '}
            <span className="font-semibold">{students.length}</span> students
          </p>
        </div>
      </Card>
    </div>
  );
}
