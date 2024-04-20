import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Card>
        <CardHeader>
          <CardTitle>starbirth</CardTitle>
          <CardDescription>The site with tournament data. Eventually.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Not sure what should be here.</p>
        </CardContent>
      </Card>
    </main>
  );
}
