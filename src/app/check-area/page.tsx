import CheckAreaForm from './CheckAreaForm'

export default function CheckArea() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Check Your Area
          </h1>
          <CheckAreaForm />
        </div>
      </main>
    </div>
  )
}