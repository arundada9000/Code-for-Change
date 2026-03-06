import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <Helmet>
                <title>404 - Page Not Found | Code for Change</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <h1 className="text-8xl font-bold text-emerald-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Page Not Found
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
                Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
            >
                Back to Home
            </Link>
        </div>
    );
};

export default NotFound;
