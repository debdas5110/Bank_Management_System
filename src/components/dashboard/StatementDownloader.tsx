import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStatements } from '@/hooks/useStatements';
import { Download, FileText, File } from 'lucide-react';

const StatementDownloader = () => {
  const { downloadCSV, downloadPDF, loading } = useStatements();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownloadCSV = () => {
    if (!startDate || !endDate) return;
    downloadCSV(startDate, endDate);
  };

  const handleDownloadPDF = () => {
    if (!startDate || !endDate) return;
    downloadPDF(startDate, endDate);
  };

  const getCurrentMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const getLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <FileText className="h-5 w-5 text-blue-600" />
          Download Account Statements
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Download your transaction history in PDF or CSV format for the selected date range
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-slate-700 dark:text-slate-300 font-medium">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-slate-700 dark:text-slate-300 font-medium">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const dates = getCurrentMonth();
              setStartDate(dates.start);
              setEndDate(dates.end);
            }}
            className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            Current Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const dates = getLastMonth();
              setStartDate(dates.start);
              setEndDate(dates.end);
            }}
            className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            Last Month
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleDownloadPDF}
            disabled={!startDate || !endDate || loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <FileText className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Download PDF Statement'}
          </Button>
          
          <Button
            onClick={handleDownloadCSV}
            disabled={!startDate || !endDate || loading}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            <File className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Download CSV Statement'}
          </Button>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
          <p className="font-medium mb-1">Download Options:</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>PDF:</strong> Formatted statement for printing and official records</li>
            <li>• <strong>CSV:</strong> Raw data format for analysis and importing into other applications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatementDownloader;
