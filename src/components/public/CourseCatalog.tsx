import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types/index';
import { formatETB } from '../../utils/rules';
import {
  Search,
  Clock,
  Users,
  Award,
  ArrowRight,
  Filter,
  Check,
  Calendar,
} from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse?: (course: Course) => void;
  onRegisterCourse?: (course: Course) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  onSelectCourse,
  onRegisterCourse,
}) => {
  const { courses, language, t, setSelectedCourseId, setActiveView } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: language === 'am' ? 'ሁሉም ኮርሶች' : 'All Courses' },
    { id: 'software', label: language === 'am' ? 'ሶፍትዌር እና ዌብ' : 'Software & Web' },
    { id: 'data_ai', label: language === 'am' ? 'ዳታ እና ኤአይ' : 'Data & AI' },
    { id: 'networking', label: language === 'am' ? 'ሳይበር ደህንነት' : 'Cybersecurity' },
    { id: 'design', label: language === 'am' ? 'UI/UX ዲዛይን' : 'UI/UX Design' },
    { id: 'kids', label: language === 'am' ? 'የልጆች ኮዲንግ' : 'Kids & Teens' },
  ];

  const filteredCourses = courses.filter((c) => {
    if (!c.active) return false;
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.title.toLowerCase().includes(query) ||
      c.titleAm.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleDetailsClick = (course: Course) => {
    setSelectedCourseId(course.id);
    if (onSelectCourse) {
      onSelectCourse(course);
    }
  };

  const handleRegisterClick = (course: Course) => {
    setSelectedCourseId(course.id);
    if (onRegisterCourse) {
      onRegisterCourse(course);
    } else {
      setActiveView('register');
    }
  };

  return (
    <section id="courses-section" className="py-16 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            {language === 'am' ? 'የስልጠና ፕሮግራሞች' : 'Curriculum & Programs'}
          </h2>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'am' ? 'ለገበያ ዝግጁ የሚያደርጉ ተግባራዊ ኮርሶች' : 'High-Impact Technology Courses'}
          </p>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {language === 'am'
              ? 'በዘመናዊ የኮምፒውተር ቤተ-ሙከራዎች እና ልምድ ባላቸው ባለሙያዎች የሚሰጡ የስልጠና አማራጮች።'
              : 'Designed with practical Ethiopian industry requirements and global remote engineering standards.'}
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'am' ? 'ምንም አይነት ኮርስ አልተገኘም።' : 'No courses found matching your criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => {
              const spotsLeft = Math.max(0, course.capacity - course.enrolledCount);
              const isAlmostFull = spotsLeft <= 5;

              return (
                <div
                  key={course.id}
                  className="group flex flex-col rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-xl hover:border-blue-500/50 transition-all overflow-hidden"
                >
                  {/* Course Image Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                    {/* Code Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold tracking-wider">
                      {course.code}
                    </span>

                    {/* Spots Status Badge */}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold backdrop-blur-xs ${
                        isAlmostFull
                          ? 'bg-red-500/90 text-white animate-pulse'
                          : 'bg-emerald-600/90 text-white'
                      }`}
                    >
                      {spotsLeft > 0 ? `${spotsLeft} Seats Left` : 'Waitlist Only'}
                    </span>

                    {/* Course Title Over Image Bottom */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-base font-bold text-white leading-snug drop-shadow-xs">
                        {language === 'am' ? course.titleAm || course.title : course.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {language === 'am' ? course.descriptionAm || course.description : course.description}
                    </p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{course.durationWeeks} Weeks ({course.hoursPerWeek}h/wk)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{course.assignedTeacherName}</span>
                      </div>
                    </div>

                    {/* Learning Outcomes Preview */}
                    <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      {(language === 'am' ? course.learningOutcomesAm : course.learningOutcomes)
                        .slice(0, 2)
                        .map((outcome, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{outcome}</span>
                          </li>
                        ))}
                    </ul>

                    {/* Price and Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Tuition Fee
                        </span>
                        <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                          {formatETB(course.baseFee)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDetailsClick(course)}
                          className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition"
                        >
                          {t('viewDetails')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRegisterClick(course)}
                          className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                        >
                          {t('registerNow')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
