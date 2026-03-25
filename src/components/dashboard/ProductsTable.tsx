import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const products = [
  { name: "Tomatoes", price: "₹40/kg", stock: "Available", status: "Active" },
  { name: "Rice (Basmati)", price: "₹120/kg", stock: "Available", status: "Active" },
  { name: "Wheat Flour", price: "₹55/kg", stock: "Low", status: "Active" },
  { name: "Onions", price: "₹30/kg", stock: "Available", status: "Active" },
  { name: "Potatoes", price: "₹25/kg", stock: "Low", status: "Inactive" },
  { name: "Green Chillies", price: "₹80/kg", stock: "Available", status: "Active" },
];

const ProductsTable = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.6 }}
    className="rounded-2xl border border-border bg-card shadow-sm"
  >
    <div className="p-6 pb-0">
      <h2 className="text-lg font-display font-semibold text-card-foreground">Recent Products</h2>
      <p className="text-sm text-muted-foreground mt-1">Your listed products overview</p>
    </div>
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.name} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-card-foreground">{p.name}</TableCell>
              <TableCell className="text-muted-foreground">{p.price}</TableCell>
              <TableCell>
                <Badge variant={p.stock === "Low" ? "destructive" : "secondary"}>
                  {p.stock}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={p.status === "Active" ? "default" : "outline"}>
                  {p.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </motion.div>
);

export default ProductsTable;
