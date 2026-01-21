import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet.jsx";
import { Button } from "../ui/button.jsx";
import { ShoppingCart, Trash2 } from "lucide-react";
import { ScrollArea } from "../ui/scrollArea.jsx"
import { Separator } from "../ui/separator.jsx";
import { Badge } from "../ui/badge.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useState } from "react";

export function CartSheet() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cart, setCart] = useState([
    // Sample cart items for demonstration
    { id: "1", title: "Oak Wood Flooring", price: 5.99, quantity: 2 },
    { id: "2", title: "Maple Wood Flooring", price: 6.49, quantity: 1 },
  ]);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  }
  const handleCheckout = () => {
    setIsCheckingOut(true); 
    setTimeout(() => {
      setIsCheckingOut(false);
      setIsOpen(false);
      setCart([]);
      toast({
        title: "Checkout Successful",
        description: "Your order has been placed successfully.",
        duration: 5000,
      });
    }, 2000);
  };


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cart.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full animate-in zoom-in">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] flex flex-col pr-0">
        <SheetHeader className="px-1">
          <SheetTitle className="font-serif text-2xl">Your Cart</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 my-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 rounded-md overflow-hidden border bg-secondary/20 shrink-0 flex items-center justify-center">
                    <div className="text-2xl text-muted-foreground/30">🏠</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium font-serif line-clamp-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <div className="space-y-4 pr-6">
            <Separator />
            <div className="flex items-center justify-between font-serif text-lg font-medium">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? "Processing..." : "Checkout"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
