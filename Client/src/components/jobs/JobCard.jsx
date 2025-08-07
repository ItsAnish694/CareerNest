import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faMapMarkerAlt,
  faDollarSign,
  faPercent,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

function JobCard({ job, currentUser }) {
  const defaultCompanyLogo =
    "https://res.cloudinary.com/dcsgpah7o/image/upload/v1751301683/ChatGPT_Image_Jun_16_2025_01_15_18_AM_jap5gt.png";

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-100 flex flex-col justify-between h-full transform hover:-translate-y-1 max-w-full mx-auto xl:max-w-6xl">
      <div className="flex-grow">
        <div className="flex items-start mb-3 sm:mb-4">
          <img
            src={job.companyInfo?.companyLogo || defaultCompanyLogo}
            alt={job.companyInfo?.companyName || "Company"}
            className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover flex-shrink-0 mr-3 sm:mr-4 border-2 border-blue-300 shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultCompanyLogo;
            }}
          />
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 leading-tight capitalize mb-0.5">
              {job.jobTitle}
            </h3>
            <p className="text-blue-800 text-sm sm:text-base lg:text-lg font-semibold">
              {job.companyInfo?.companyName || "Unknown Company"}
            </p>
          </div>
        </div>

        <p className="text-gray-700 text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
          {job.jobDescription}
        </p>

        <div className="space-y-1.5 sm:space-y-2 text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
          <p className="flex items-center text-xs sm:text-sm lg:text-base">
            <FontAwesomeIcon
              icon={faBriefcase}
              className="mr-2 sm:mr-3 text-blue-600 text-base sm:text-lg lg:text-xl"
            />
            <span className="capitalize font-medium">{job.jobType}</span>
            <span className="mx-1 text-gray-400">•</span>
            <span className="capitalize font-medium">
              {job.experienceLevel}
            </span>
          </p>
          <p className="flex items-center capitalize text-xs sm:text-sm lg:text-base">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="mr-2 sm:mr-3 text-blue-600 text-base sm:text-lg lg:text-xl"
            />
            {job.companyInfo?.companyLocation?.city || "Any City"},{" "}
            {job.companyInfo?.companyLocation?.district || "Any District"}
          </p>
          <p className="flex items-center text-xs sm:text-sm lg:text-base">
            <FontAwesomeIcon
              icon={faDollarSign}
              className="mr-2 sm:mr-3 text-blue-600 text-base sm:text-lg lg:text-xl"
            />
            <span className="font-medium">{job.salary}</span>
          </p>
          <p className="flex items-center text-gray-500 text-xs sm:text-sm lg:text-base">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="mr-2 sm:mr-3 text-blue-600 text-base sm:text-lg lg:text-xl"
            />
            Deadline:
            {format(new Date(job.applicationDeadline), "MMM dd, yyyy (EEEE)")}
          </p>
        </div>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {job.requiredSkills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-medium capitalize shadow-sm"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-medium shadow-sm">
                +{job.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        )}

        {currentUser?.role === "user" &&
          typeof job.totalMatchedScore === "number" && (
            <div className="flex items-center bg-green-50 text-green-800 font-bold text-sm px-3 py-1 sm:px-4 sm:py-1.5 rounded-md mb-3 sm:mb-4 shadow-sm">
              <FontAwesomeIcon icon={faPercent} className="mr-2" />
              Match Score: {job.totalMatchedScore}%
            </div>
          )}
      </div>

      <div className="mt-auto pt-3 sm:pt-4">
        <Link
          to={`/jobs/${job._id}`}
          className="block w-full text-center px-6 py-2 sm:px-7 sm:py-2.5 lg:px-8 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-md shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base lg:text-lg"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default JobCard;
