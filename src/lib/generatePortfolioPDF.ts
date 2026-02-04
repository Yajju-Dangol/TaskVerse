import jsPDF from 'jspdf';
import { InternPortfolioItem } from './db';

interface UserData {
    name: string;
    email: string;
    level?: number;
    points?: number;
}

export function generatePortfolioPDF(user: UserData, portfolio: InternPortfolioItem[]) {
    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Colors
    const primaryColor: [number, number, number] = [37, 99, 235]; // Blue-600
    const secondaryColor: [number, number, number] = [75, 85, 99]; // Gray-600
    const lightBg: [number, number, number] = [243, 244, 246]; // Gray-100
    const amberColor: [number, number, number] = [180, 83, 9]; // Amber-700
    const amberBg: [number, number, number] = [255, 251, 235]; // Amber-50

    // Fonts
    doc.setFont('helvetica');

    // --- Header ---
    // Blue accent line at top
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 5, 'F');

    // Name
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, margin, 30);

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`Intern Portfolio`, margin, 37);

    // Contact Info
    doc.setFontSize(10);
    doc.text(`Email: ${user.email}`, margin, 45);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 50);

    // --- Summary Stats ---
    const startY = 65;
    const boxWidth = 50;
    const boxHeight = 25;
    const gap = 10;

    // Helper to draw stat box
    const drawStatBox = (x: number, label: string, value: string | number) => {
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.roundedRect(x, startY, boxWidth, boxHeight, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), x + boxWidth / 2, startY + 12, { align: 'center' });

        doc.setFontSize(9);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.text(label, x + boxWidth / 2, startY + 20, { align: 'center' });
    };

    drawStatBox(margin, 'Level', user.level || 1);
    drawStatBox(margin + boxWidth + gap, 'Total Points', user.points || 0);
    drawStatBox(margin + (boxWidth + gap) * 2, 'Projects Completed', portfolio.length);

    // Calculate Avg Rating
    const avgRating = portfolio.length > 0
        ? (portfolio.reduce((acc, item) => acc + (item.rating || 0), 0) / portfolio.length).toFixed(1)
        : 'N/A';
    drawStatBox(margin + (boxWidth + gap) * 3, 'Avg Rating', avgRating);

    // --- Skills Section ---
    let currentY = startY + boxHeight + 20;

    const skills = Array.from(new Set(portfolio.flatMap(item => item.skills)));
    if (skills.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Skills', margin, currentY);

        currentY += 10;

        // Draw skills as "tags"
        let xPos = margin;
        const tagHeight = 8;
        const xGap = 5;
        const yGap = 5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        skills.forEach(skill => {
            const textWidth = doc.getTextWidth(skill);
            const tagWidth = textWidth + 10;

            // Wrap to next line if needed
            if (xPos + tagWidth > pageWidth - margin) {
                xPos = margin;
                currentY += tagHeight + yGap;
            }

            // Draw tag background
            doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.roundedRect(xPos, currentY - 6, tagWidth, tagHeight, 2, 2, 'S');

            // Draw tag text
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.text(skill, xPos + 5, currentY - 1);

            xPos += tagWidth + xGap;
        });

        currentY += 20;
    } else {
        currentY += 20;
    }

    // --- Detailed Projects Section ---
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Project History', margin, currentY);

    // Add underline
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY + 2, margin + 70, currentY + 2);

    currentY += 15;


    portfolio.forEach((item, index) => {
        // --- Page Break Check ---
        // Basic check if we are too close to bottom for a header + some text
        if (currentY > pageHeight - 50) {
            doc.addPage();
            currentY = margin;
        }

        // --- Project Header ---
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'F');

        // Title
        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(item.task_title, margin + 5, currentY + 9);

        // Meta (Date | Points | Rating)
        const metaText = `${new Date(item.completed_date).toLocaleDateString()}   |   ${item.points} pts   |   ${item.rating ? item.rating + '/5' : '-'}`;
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.text(metaText, pageWidth - margin - 5, currentY + 9, { align: 'right' });

        currentY += 22;

        // --- Client Name ---
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Client:', margin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(item.business_name, margin + 15, currentY);

        currentY += 8;

        // --- Task Description ---
        if (item.task_description) {
            doc.setFont('helvetica', 'bold');
            doc.text('Task:', margin, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            const descLines = doc.splitTextToSize(item.task_description, contentWidth - 15);
            // indent slightly
            doc.text(descLines, margin + 15, currentY);

            currentY += (descLines.length * 5) + 8;
        }

        // --- User Submission Note ---
        if (item.description) {
            // Check for page break
            if (currentY > pageHeight - 30) {
                doc.addPage();
                currentY = margin;
            }

            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('My Work:', margin, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            const subLines = doc.splitTextToSize(item.description, contentWidth - 15);
            doc.text(subLines, margin + 15, currentY);

            currentY += (subLines.length * 5) + 8;
        }

        // --- Business Review ---
        if (item.review) {
            // Check page break for review
            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }

            // Review Box Background
            doc.setFillColor(amberBg[0], amberBg[1], amberBg[2]);
            doc.setDrawColor(amberColor[0], amberColor[1], amberColor[2]);

            const reviewLines = doc.splitTextToSize(item.review, contentWidth - 20);
            const boxHeight = (reviewLines.length * 5) + 16;

            // Draw box with slight left border accent? or just full box
            doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'F');
            // doc.rect(margin, currentY, 1, boxHeight, 'F'); // border accent

            doc.setTextColor(amberColor[0], amberColor[1], amberColor[2]);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Business Feedback:', margin + 5, currentY + 8);

            doc.setTextColor(50, 50, 50);
            doc.setFont('helvetica', 'italic');
            doc.text(reviewLines, margin + 5, currentY + 16);

            currentY += boxHeight + 10;
        } else {
            currentY += 5;
        }

        // --- Separator ---
        if (index < portfolio.length - 1) {
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 10;
        }
    });

    // Save Name
    const filename = `${user.name.replace(/\s+/g, '_')}_Portfolio.pdf`;
    doc.save(filename);
}
