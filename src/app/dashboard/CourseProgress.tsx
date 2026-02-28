'use client'

import Link from 'next/link'
import { Course } from '@/lib/types'

interface CourseWithProgress extends Course {
  progress: number
  totalLessons: number
  completedLessons: number
}

interface CourseProgressProps {
  courses: CourseWithProgress[]
}

export default function CourseProgress({ courses }: CourseProgressProps) {
  if (courses.length === 0) {
    return null
  }

  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Your Courses</h2>
      <ul className="space-y-4">
        {courses.map(course => (
          <li key={course.id}>
            <Link href={`/courses/${course.id}`} className="block hover:bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-indigo-600">{course.title}</p>
                <span className="text-sm text-gray-500">{Math.round(course.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{course.completedLessons} / {course.totalLessons} lessons completed</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
