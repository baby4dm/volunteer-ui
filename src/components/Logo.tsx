import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export const Logo = ({ className = "", variant = "dark" }: LogoProps) => {
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  const iconColor = "text-blue-600";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <VolunteerActivismIcon className={`${iconColor}`} sx={{ fontSize: 40 }} />
      <span className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
        Допомога
      </span>
    </div>
  );
};
