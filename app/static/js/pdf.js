// PDF Generator Module
const PDFGenerator = {
    generate: function(content, level, studentInfo = {}) {
        if (!window.jspdf) {
            console.error('jsPDF not loaded');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set document properties
        doc.setProperties({
            title: `${level} Learning Roadmap`,
            subject: 'Personalized Education Plan',
            creator: 'AI Education Pathfinder'
        });

        // Add header
        this.addHeader(doc, level);
        
        // Add student info section
        this.addStudentInfo(doc, studentInfo);
        
        // Add roadmap content
        this.addRoadmapContent(doc, content);
        
        // Add footer
        this.addFooter(doc);
        
        // Save PDF
        doc.save(`${level}_learning_roadmap.pdf`);
    },

    addHeader: function(doc, level) {
        // Title
        doc.setFontSize(22);
        doc.setTextColor(40, 53, 147);
        doc.text('Personalized Learning Roadmap', 105, 20, { align: 'center' });
        
        // Level badge
        const colors = {
            beginner: [255, 235, 59],
            intermediate: [76, 175, 80],
            advanced: [244, 67, 54]
        };
        doc.setFillColor(...colors[level]);
        doc.roundedRect(80, 30, 50, 10, 5, 5, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(level.toUpperCase(), 105, 36, { align: 'center' });
        
        // Divider line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);
    },

    addStudentInfo: function(doc, info) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        
        let yPosition = 50;
        doc.text(`Generated for: ${info.name || 'Student'}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Age: ${info.age || '--'}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Math Skill: ${info.math_skill || '--'}/10`, 20, yPosition);
        yPosition += 5;
        doc.text(`Goal: ${info.goal ? info.goal.replace('_', ' ') : '--'}`, 20, yPosition);
        
        // Add space
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
    },

    addRoadmapContent: function(doc, content) {
        doc.setFontSize(12);
        doc.setTextColor(33, 33, 33);
        
        // Process content with proper formatting
        const lines = content.split('\n');
        let yPosition = 70;
        
        lines.forEach(line => {
            if (line.trim().endsWith(':')) {
                // Section header
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(line.trim(), 20, yPosition);
                doc.setFontSize(12);
                doc.setFont(undefined, 'normal');
                yPosition += 8;
            } else if (line.trim().startsWith('-')) {
                // List item
                doc.text('• ' + line.trim().substring(1).trim(), 25, yPosition);
                yPosition += 7;
            } else {
                // Regular text
                const textLines = doc.splitTextToSize(line, 170);
                doc.text(textLines, 20, yPosition);
                yPosition += textLines.length * 7;
            }
            
            // Add space between items
            yPosition += 3;
            
            // Add new page if needed
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
        });
    },

    addFooter: function(doc) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });
        doc.text('AI Education Pathfinder - https://your-edu-app.com', 105, 290, { align: 'center' });
    }
};

// Connect to global namespace
window.generatePDF = function(content, level, studentInfo = {}) {
    PDFGenerator.generate(content, level, studentInfo);
};