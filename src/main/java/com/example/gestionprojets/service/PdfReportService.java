package com.example.gestionprojets.service;

import com.example.gestionprojets.entity.Deliverable;
import com.example.gestionprojets.entity.Project;
import com.example.gestionprojets.entity.Sprint;
import com.example.gestionprojets.entity.Task;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PdfReportService {

    // Couleurs de la charte graphique
    private static final Color PRIMARY_COLOR = new Color(0, 51, 102); // Bleu nuit
    private static final Color ACCENT_COLOR = new Color(230, 240, 250); // Bleu très clair
    private static final Color SUCCESS_COLOR = new Color(0, 128, 0); // Vert
    private static final Color PENDING_COLOR = new Color(255, 140, 0); // Orange

    public byte[] generateProjectReport(Project project) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            
            // Ajout des pieds de page (numérotation)
            HeaderFooter footer = new HeaderFooter(new Phrase("Page ", FontFactory.getFont(FontFactory.HELVETICA, 10)), true);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setBorder(Rectangle.NO_BORDER);
            document.setFooter(footer);

            document.open();

            // --- PAGE DE GARDE ---
            addTitlePage(document, project);
            document.newPage();

            // --- 1. FICHE D'IDENTITÉ DU PROJET ---
            addSectionTitle(document, "1. Fiche d'Identité du Projet");
            addProjectIdentityTable(document, project);
            document.add(new Paragraph("\n"));

            // --- 2. SYNTHÈSE DE L'AVANCEMENT ---
            addSectionTitle(document, "2. Synthèse de l'Avancement");
            addProgressSummary(document, project);
            document.add(new Paragraph("\n"));

            // --- 3. DÉTAIL DES RÉALISATIONS (SPRINTS) ---
            addSectionTitle(document, "3. Détail des Réalisations par Phase");
            addSprintsDetails(document, project);

            // --- 4. LIVRABLES ---
            addSectionTitle(document, "4. Livrables Remis");
            addDeliverablesSection(document, project);

            // --- 5. VALIDATION ---
            addSectionTitle(document, "5. Validation");
            addSignatureSection(document);

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }

        return out.toByteArray();
    }

    private void addTitlePage(Document document, Project project) throws DocumentException {
        // Cadre global
        PdfPTable borderTable = new PdfPTable(1);
        borderTable.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setBorderWidth(2);
        cell.setBorderColor(PRIMARY_COLOR);
        cell.setPadding(40);
        cell.setMinimumHeight(600); // Hauteur minimale pour centrer verticalement

        // En-tête Université / École
        Paragraph university = new Paragraph("RAPPORT DE PROJET ACADÉMIQUE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.GRAY));
        university.setAlignment(Element.ALIGN_CENTER);
        university.setSpacingAfter(60);
        
        // Titre du Projet
        Paragraph title = new Paragraph(project.getName().toUpperCase(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, PRIMARY_COLOR));
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        
        // Description courte
        Paragraph desc = new Paragraph(project.getDescription() != null ? project.getDescription() : "", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 12));
        desc.setAlignment(Element.ALIGN_CENTER);
        desc.setSpacingAfter(80);

        // Informations Équipe
        PdfPTable infoTable = new PdfPTable(1);
        infoTable.setWidthPercentage(80);
        infoTable.setHorizontalAlignment(Element.ALIGN_CENTER);

        // Étudiants
        PdfPCell studentCell = new PdfPCell();
        studentCell.setBorder(Rectangle.NO_BORDER);
        studentCell.addElement(new Paragraph("Réalisé par :", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_COLOR)));
        
        project.getMembers().stream()
                .filter(m -> "MEMBER".equals(m.getRole()) || "OWNER".equals(m.getRole()))
                .forEach(m -> studentCell.addElement(new Paragraph("• " + m.getUser().getFirstname() + " " + m.getUser().getLastname(), FontFactory.getFont(FontFactory.HELVETICA, 12))));
        
        infoTable.addCell(studentCell);

        // Encadrant
        String supervisorName = project.getMembers().stream()
                .filter(m -> "TEACHER".equals(m.getRole()))
                .map(m -> m.getUser().getFirstname() + " " + m.getUser().getLastname())
                .findFirst()
                .orElse(null);

        if (supervisorName != null) {
            PdfPCell teacherCell = new PdfPCell();
            teacherCell.setBorder(Rectangle.NO_BORDER);
            teacherCell.setPaddingTop(20);
            teacherCell.addElement(new Paragraph("Sous la direction de :", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_COLOR)));
            teacherCell.addElement(new Paragraph(supervisorName, FontFactory.getFont(FontFactory.HELVETICA, 12)));
            infoTable.addCell(teacherCell);
        }

        // Date
        Paragraph date = new Paragraph("\n\n" + LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
        date.setAlignment(Element.ALIGN_CENTER);

        // Assemblage
        cell.addElement(university);
        cell.addElement(title);
        cell.addElement(desc);
        cell.addElement(infoTable);
        cell.addElement(date);

        borderTable.addCell(cell);
        document.add(borderTable);
    }

    private void addProjectIdentityTable(Document document, Project project) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 3});
        table.setSpacingBefore(10);

        addIdentityRow(table, "Nom du projet", project.getName());
        addIdentityRow(table, "Date du rapport", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        addIdentityRow(table, "Statut actuel", project.getStatus());
        
        long sprintCount = project.getSprints().size();
        addIdentityRow(table, "Nombre de phases", String.valueOf(sprintCount));

        document.add(table);
    }

    private void addIdentityRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
        labelCell.setBackgroundColor(ACCENT_COLOR);
        labelCell.setPadding(8);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, FontFactory.getFont(FontFactory.HELVETICA, 11)));
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }

    private void addProgressSummary(Document document, Project project) throws DocumentException {
        long totalTasks = project.getSprints().stream().flatMap(s -> s.getTasks().stream()).count();
        long completedTasks = project.getSprints().stream().flatMap(s -> s.getTasks().stream())
                .filter(t -> "done".equalsIgnoreCase(t.getStatus()) || "Terminé".equalsIgnoreCase(t.getStatus()) || "Fait".equalsIgnoreCase(t.getStatus())).count();
        
        int progress = totalTasks > 0 ? (int) ((double) completedTasks / totalTasks * 100) : 0;

        Paragraph p = new Paragraph();
        p.add(new Chunk("Progression globale : ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
        p.add(new Chunk(progress + "%", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, progress == 100 ? SUCCESS_COLOR : PRIMARY_COLOR)));
        document.add(p);

        Paragraph p2 = new Paragraph("Tâches réalisées : " + completedTasks + " / " + totalTasks, FontFactory.getFont(FontFactory.HELVETICA, 11));
        p2.setSpacingAfter(10);
        document.add(p2);
    }

    private void addSprintsDetails(Document document, Project project) throws DocumentException {
        List<Sprint> sortedSprints = project.getSprints().stream()
                .sorted((s1, s2) -> Integer.compare(s1.getSprintNumber(), s2.getSprintNumber()))
                .collect(Collectors.toList());

        for (Sprint sprint : sortedSprints) {
            // Titre du Sprint
            Paragraph sprintTitle = new Paragraph("Phase " + sprint.getSprintNumber() + " : " + sprint.getName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, PRIMARY_COLOR));
            sprintTitle.setSpacingBefore(15);
            document.add(sprintTitle);
            
            document.add(new Paragraph("Période : " + sprint.getStartDate() + " au " + sprint.getEndDate(), FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY)));
            document.add(new Paragraph("\n"));

            if (sprint.getTasks().isEmpty()) {
                document.add(new Paragraph("   Aucune tâche planifiée pour cette phase.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 11)));
            } else {
                PdfPTable table = new PdfPTable(3);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{5, 2, 2});
                
                // En-têtes
                addTableHeader(table, "Tâche / Description");
                addTableHeader(table, "Statut");
                addTableHeader(table, "Responsable");

                for (Task task : sprint.getTasks()) {
                    // Cellule Tâche
                    String taskText = task.getTitle();
                    if (task.getDescription() != null && !task.getDescription().isEmpty()) {
                        taskText += "\n" + task.getDescription();
                    }
                    PdfPCell taskCell = new PdfPCell(new Phrase(taskText, FontFactory.getFont(FontFactory.HELVETICA, 10)));
                    taskCell.setPadding(6);
                    table.addCell(taskCell);

                    // Cellule Statut avec couleur
                    boolean isDone = "done".equalsIgnoreCase(task.getStatus()) || "Terminé".equalsIgnoreCase(task.getStatus()) || "Fait".equalsIgnoreCase(task.getStatus());
                    PdfPCell statusCell = new PdfPCell(new Phrase(isDone ? "Terminé" : "En cours / À faire", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, isDone ? SUCCESS_COLOR : PENDING_COLOR)));
                    statusCell.setPadding(6);
                    statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    statusCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    table.addCell(statusCell);

                    // Cellule Responsable
                    String assignee = task.getAssignedUser() != null ? 
                            task.getAssignedUser().getFirstname() + " " + task.getAssignedUser().getLastname() : "-";
                    PdfPCell assigneeCell = new PdfPCell(new Phrase(assignee, FontFactory.getFont(FontFactory.HELVETICA, 10)));
                    assigneeCell.setPadding(6);
                    assigneeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    assigneeCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    table.addCell(assigneeCell);
                }
                document.add(table);
            }
        }
    }

    private void addDeliverablesSection(Document document, Project project) throws DocumentException {
        if (project.getDeliverables().isEmpty()) {
            document.add(new Paragraph("Aucun livrable n'a encore été soumis sur la plateforme.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 11)));
        } else {
            com.lowagie.text.List list = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
            list.setListSymbol("\u2022");
            list.setIndentationLeft(20);

            for (Deliverable deliverable : project.getDeliverables()) {
                String text = deliverable.getName() + " (Remis le " + deliverable.getSubmittedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + ")";
                list.add(new ListItem(text, FontFactory.getFont(FontFactory.HELVETICA, 11)));
            }
            document.add(list);
        }
    }

    private void addSignatureSection(Document document) throws DocumentException {
        document.add(new Paragraph("\n\n\n"));
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        
        PdfPCell studentSign = new PdfPCell(new Phrase("Signature de l'étudiant :", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
        studentSign.setBorder(Rectangle.NO_BORDER);
        studentSign.setPaddingBottom(50);
        
        PdfPCell teacherSign = new PdfPCell(new Phrase("Signature de l'encadrant :", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
        teacherSign.setBorder(Rectangle.NO_BORDER);
        teacherSign.setPaddingBottom(50);

        table.addCell(studentSign);
        table.addCell(teacherSign);
        
        document.add(table);
    }

    private void addSectionTitle(Document document, String titleText) throws DocumentException {
        Paragraph title = new Paragraph(titleText, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, PRIMARY_COLOR));
        title.setSpacingBefore(25);
        title.setSpacingAfter(10);
        
        // Ligne de soulignement
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderWidth(1);
        cell.setBorderColor(PRIMARY_COLOR);
        line.addCell(cell);

        document.add(title);
        document.add(line);
    }

    private void addTableHeader(PdfPTable table, String headerTitle) {
        PdfPCell header = new PdfPCell(new Phrase(headerTitle, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE)));
        header.setBackgroundColor(PRIMARY_COLOR);
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        header.setVerticalAlignment(Element.ALIGN_MIDDLE);
        header.setPadding(8);
        table.addCell(header);
    }
}
