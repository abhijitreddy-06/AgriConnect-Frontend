import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const orders = [
  { id: "#1234", customer: "Rahul Sharma", amount: "₹2,400", status: "Delivered" },
  { id: "#1235", customer: "Priya Patel", amount: "₹1,800", status: "Pending" },
  { id: "#1236", customer: "Amit Singh", amount: "₹3,200", status: "Delivered" },
  { id: "#1237", customer: "Neha Gupta", amount: "₹950", status: "Cancelled" },
  { id: "#1238", customer: "Vikram Rao", amount: "₹4,100", status: "Pending" },
];

const statusVariant = (status: string) => {
  if (status === "Delivered") return "default";
  if (status === "Pending") return "secondary";
  return "destructive";
};

const OrdersTable = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.7 }}
    className="rounded-2xl border border-border bg-card shadow-sm"
  >
    <div className="p-6 pb-0">
      <h2 className="text-lg font-display font-semibold text-card-foreground">Recent Orders</h2>
      <p className="text-sm text-muted-foreground mt-1">Latest customer orders</p>
    </div>
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-card-foreground">{o.id}</TableCell>
              <TableCell className="text-muted-foreground">{o.customer}</TableCell>
              <TableCell className="font-medium text-card-foreground">{o.amount}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </motion.div>
);

export default OrdersTable;
