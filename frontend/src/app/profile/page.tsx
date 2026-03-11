export default function ProfilePage() {
  return (
    <div className="relative min-h-[60vh]">
      {/* Avatar positioned top-left, about a quarter down vertically */}
      <div className="absolute left-6 top-[25%]">
        <div className="h-28 w-28 rounded-full bg-gray-200 ring-4 ring-white overflow-hidden">
          {/* Placeholder image; replace src with user avatar when available */}
          <img
            src="/avatar-placeholder.png"
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="pt-8 pl-48 pr-6">
        {/* Page content goes here */}
      </div>
    </div>
  );
}
