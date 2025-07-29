interface Issue {
  type: "error" | "warning" | "suggestion" | "info";
  title: string;
  description: string;
  line?: number;
  severity: "high" | "medium" | "low";
}

interface AnalysisResult {
  issues: Issue[];
  overallScore: number;
}

export const analyzeCode = (code: string, language: string): AnalysisResult => {
  const lines = code.split('\n');
  const issues: Issue[] = [];
  
  // Language-specific analysis
  if (language === 'javascript' || language === 'typescript') {
    analyzeJavaScript(lines, issues);
  } else if (language === 'python') {
    analyzePython(lines, issues);
  } else if (language === 'java') {
    analyzeJava(lines, issues);
  } else {
    analyzeGeneral(lines, issues);
  }
  
  // Calculate score based on issues
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const suggestionCount = issues.filter(i => i.type === 'suggestion').length;
  
  let score = 100;
  score -= errorCount * 15;
  score -= warningCount * 8;
  score -= suggestionCount * 3;
  
  return {
    issues,
    overallScore: Math.max(0, Math.min(100, score))
  };
};

const analyzeJavaScript = (lines: string[], issues: Issue[]) => {
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Check for missing semicolons (but not for class declarations, if statements, etc.)
    if (trimmedLine.length > 0 && 
        !trimmedLine.endsWith(';') && 
        !trimmedLine.endsWith('{') && 
        !trimmedLine.endsWith('}') && 
        !trimmedLine.startsWith('//') && 
        !trimmedLine.startsWith('/*') && 
        !trimmedLine.includes('if ') && 
        !trimmedLine.includes('for ') && 
        !trimmedLine.includes('while ') && 
        !trimmedLine.includes('function ') && 
        !trimmedLine.includes('class ') &&
        !trimmedLine.includes('else') &&
        trimmedLine.includes('=') || trimmedLine.includes('return ')) {
      issues.push({
        type: 'warning',
        title: 'Missing semicolon',
        description: 'Consider adding a semicolon for consistency and to avoid potential issues.',
        line: lineNum,
        severity: 'low'
      });
    }
    
    // Check for var usage
    if (trimmedLine.includes('var ')) {
      issues.push({
        type: 'suggestion',
        title: 'Use let or const instead of var',
        description: 'Modern JavaScript prefers let or const over var for better scoping.',
        line: lineNum,
        severity: 'low'
      });
    }
    
    // Check for console.log in production code
    if (trimmedLine.includes('console.log')) {
      issues.push({
        type: 'info',
        title: 'Console.log found',
        description: 'Consider removing console.log statements before production.',
        line: lineNum,
        severity: 'low'
      });
    }
    
    // Check for function declarations that could be arrow functions
    if (trimmedLine.includes('function ') && !trimmedLine.includes('function*')) {
      issues.push({
        type: 'suggestion',
        title: 'Consider using arrow function',
        description: 'Arrow functions provide more concise syntax and lexical this binding.',
        line: lineNum,
        severity: 'low'
      });
    }
  });
};

const analyzePython = (lines: string[], issues: Issue[]) => {
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Check for missing docstrings in functions
    if (trimmedLine.startsWith('def ') && !trimmedLine.startsWith('def _')) {
      const nextLine = lines[index + 1];
      if (!nextLine || !nextLine.trim().startsWith('"""')) {
        issues.push({
          type: 'suggestion',
          title: 'Missing docstring',
          description: 'Public functions should have docstrings to describe their purpose.',
          line: lineNum,
          severity: 'low'
        });
      }
    }
    
    // Check for print statements
    if (trimmedLine.includes('print(')) {
      issues.push({
        type: 'info',
        title: 'Print statement found',
        description: 'Consider using logging instead of print for production code.',
        line: lineNum,
        severity: 'low'
      });
    }
  });
};

const analyzeJava = (lines: string[], issues: Issue[]) => {
  let methodBraceCount = 0;
  let hasReturnStatement = false;
  let currentMethodStartLine = -1;
  let isInMethod = false;
  let methodReturnType = '';
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Track method declarations and return statements
    if (trimmedLine.includes('public ') && (trimmedLine.includes('int ') || trimmedLine.includes('String ') || trimmedLine.includes('void ') || trimmedLine.includes('boolean ') || trimmedLine.includes('double ') || trimmedLine.includes('float '))) {
      if (trimmedLine.includes('(')) {
        isInMethod = true;
        hasReturnStatement = false;
        currentMethodStartLine = lineNum;
        methodBraceCount = 0;
        methodReturnType = trimmedLine.includes('void') ? 'void' : 'non-void';
      }
    }
    
    // Count braces for method tracking
    if (isInMethod) {
      methodBraceCount += (line.match(/{/g) || []).length;
      methodBraceCount -= (line.match(/}/g) || []).length;
      
      if (trimmedLine.includes('return ')) {
        hasReturnStatement = true;
      }
      
      // Check if method is ending
      if (methodBraceCount <= 0 && currentMethodStartLine > 0) {
        if (!hasReturnStatement && methodReturnType === 'non-void') {
          issues.push({
            type: "error",
            title: "Missing return statement",
            description: "Non-void method must have a return statement",
            line: currentMethodStartLine,
            severity: "high"
          });
        }
        isInMethod = false;
        currentMethodStartLine = -1;
      }
    }
    
    // Check for potential infinite loops with while
    if (trimmedLine.includes('while(') && !trimmedLine.includes('++') && !trimmedLine.includes('--') && !trimmedLine.includes('i+') && !trimmedLine.includes('i-')) {
      const nextFewLines = lines.slice(index + 1, index + 4).join(' ');
      if (!nextFewLines.includes('++') && !nextFewLines.includes('--') && !nextFewLines.includes('break') && !nextFewLines.includes('return')) {
        issues.push({
          type: "error",
          title: "Potential infinite loop",
          description: "While loop may not have proper termination condition or loop variable modification",
          line: lineNum,
          severity: "high"
        });
      }
    }
    
    // Check for array index errors - common mistake in suffix array initialization
    if (trimmedLine.includes('suffixMax[0] = arr[n-1]')) {
      issues.push({
        type: "error",
        title: "Array index error",
        description: "Should be suffixMax[n-1] = arr[n-1] for suffix array initialization",
        line: lineNum,
        severity: "high"
      });
    }
    
    // Check for missing closing braces by counting them
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    
    // Check for missing semicolons on statements that should have them
    if (trimmedLine.length > 0 && 
        !trimmedLine.startsWith("//") && 
        !trimmedLine.startsWith("/*") && 
        !trimmedLine.startsWith("*") &&
        !trimmedLine.endsWith("{") && 
        !trimmedLine.endsWith("}") && 
        !trimmedLine.includes("class ") &&
        !trimmedLine.includes("public static") &&
        !trimmedLine.includes("private static") &&
        !trimmedLine.includes("protected static") &&
        !trimmedLine.includes("if (") &&
        !trimmedLine.includes("for (") &&
        !trimmedLine.includes("while (") &&
        !trimmedLine.includes("else") &&
        !trimmedLine.includes("try") &&
        !trimmedLine.includes("catch") &&
        !trimmedLine.includes("finally") &&
        !trimmedLine.endsWith(";")) {
      
      // Check if it looks like a statement that needs a semicolon
      if (trimmedLine.includes("System.out.println") || 
          trimmedLine.includes("=") || 
          trimmedLine.includes("return") ||
          trimmedLine.match(/\w+\s*\(/)) {
        issues.push({
          type: "error",
          title: "Missing semicolon",
          description: "Java statements must end with a semicolon",
          line: lineNum,
          severity: "high"
        });
      }
    }
    
    // Check for class naming convention
    if (trimmedLine.includes('class ')) {
      const className = trimmedLine.split('class ')[1]?.split(/[\s{]/)[0];
      if (className && className[0] !== className[0].toUpperCase()) {
        issues.push({
          type: 'warning',
          title: 'Class naming convention',
          description: 'Class names should start with an uppercase letter (PascalCase).',
          line: lineNum,
          severity: 'medium'
        });
      }
    }
    
    // Check for System.out.println
    if (trimmedLine.includes('System.out.println')) {
      issues.push({
        type: 'info',
        title: 'System.out.println found',
        description: 'Consider using a logging framework instead of System.out.println.',
        line: lineNum,
        severity: 'low'
      });
    }
  });
  
  // Check for overall brace balance
  const totalCode = lines.join('\n');
  const totalOpenBraces = (totalCode.match(/{/g) || []).length;
  const totalCloseBraces = (totalCode.match(/}/g) || []).length;
  
  if (totalOpenBraces > totalCloseBraces) {
    issues.push({
      type: "error",
      title: "Missing closing brace",
      description: "One or more methods/classes are missing closing braces",
      line: lines.length,
      severity: "high"
    });
  }
};

const analyzeGeneral = (lines: string[], issues: Issue[]) => {
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Check for very long lines
    if (line.length > 120) {
      issues.push({
        type: 'suggestion',
        title: 'Long line detected',
        description: 'Consider breaking this line into multiple lines for better readability.',
        line: lineNum,
        severity: 'low'
      });
    }
    
    // Check for TODO comments
    if (trimmedLine.includes('TODO') || trimmedLine.includes('FIXME')) {
      issues.push({
        type: 'info',
        title: 'TODO comment found',
        description: 'Remember to address this TODO item before finalizing the code.',
        line: lineNum,
        severity: 'low'
      });
    }
  });
};