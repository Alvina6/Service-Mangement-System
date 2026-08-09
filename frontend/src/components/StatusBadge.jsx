const statusStyles = {
  pending: "bg-slate/10 text-slate",
  assigned: "bg-frost/10 text-frost-dark",
  in_progress: "bg-frost/10 text-frost-dark",
  scheduled: "bg-frost/10 text-frost-dark",
  en_route: "bg-frost/10 text-frost-dark",
  completed: "bg-mint/10 text-mint",
  cancelled: "bg-ember/10 text-ember-dark",
  draft: "bg-slate/10 text-slate",
  sent: "bg-frost/10 text-frost-dark",
  accepted: "bg-mint/10 text-mint",
  rejected: "bg-ember/10 text-ember-dark",
  expired: "bg-ember/10 text-ember-dark",
  active: "bg-mint/10 text-mint",
  expiring_soon: "bg-ember/10 text-ember-dark",
  unpaid: "bg-ember/10 text-ember-dark",
  partially_paid: "bg-frost/10 text-frost-dark",
  paid: "bg-mint/10 text-mint",
  overdue: "bg-ember/10 text-ember-dark",
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-slate/10 text-slate";
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize ${style}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
