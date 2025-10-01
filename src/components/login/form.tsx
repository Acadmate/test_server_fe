// Updated LoginForm.tsx
"use client";
import "@/app/globals.css";
import "@/components/loaderButton.css";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { setCookie } from "@/lib/cookies";
import { setupAuthInterceptor } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().max(25),
  password: z.string().max(50),
});

interface LoginResponse {
  email: string;
  message: string;
  success: boolean;
  token: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export default function LoginForm() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const { setAuthenticatedUser } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    values
  ) => {
    setLoading(true);
    setError("");

    const payload = {
      username: values.username,
      password: values.password,
    };

    try {
      const response = await axios.post(`${api_url}/login`, payload, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const data: LoginResponse = response.data;

        if (data.success && data.token) {
          setCookie("token", data.token, 7);
          setupAuthInterceptor();
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.token}`;

          // Update auth store and trigger auth check
          if (data.user) {
            setAuthenticatedUser(data.user);
          }

          window.location.href = "/attendance";
        } else {
          setError(
            data.message || "Login failed. Please check your credentials."
          );
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError(
            "Login failed. Please check your connection or credentials."
          );
        }
      } else {
        setError("Login failed. Please check your connection or credentials.");
      }
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 max-w-md mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Email Address"
                  type="text"
                  {...field}
                  required
                  className="w-full h-14 px-5 text-white bg-black/70 rounded-lg border border-purple-500/50 focus:border-purple-400 focus:ring-purple-500/20 focus:ring-2 outline-none text-base font-medium transition-all duration-300 placeholder:text-gray-400"
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Password"
                  type={visible ? "text" : "password"}
                  {...field}
                  required
                  className="w-full h-14 px-5 text-white bg-black/70 rounded-lg border border-blue-500/50 focus:border-blue-400 focus:ring-blue-500/20 focus:ring-2 outline-none text-base font-medium transition-all duration-300 placeholder:text-gray-400"
                />
                {field.value.length > 0 && (
                  <div
                    onClick={() => setVisible((prev) => !prev)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-blue-400 cursor-pointer"
                  >
                    {visible ? <IoMdEye /> : <IoMdEyeOff />}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <Button
          type="submit"
          className="w-3/4 sm:w-1/2 self-center h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-2xl hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 active:scale-95 disabled:opacity-70 mt-6"
          disabled={loading}
        >
          {loading ? <div className="loader"></div> : "Log In"}
        </Button>
      </form>
    </Form>
  );
}
