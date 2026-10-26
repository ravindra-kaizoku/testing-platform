import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_vitap_presentation_with_uploaded_diagram():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Image Paths
    LOGO_PATH = r"C:\Users\ravindra_007\.gemini\antigravity\brain\48683922-fa9d-4d33-a4ed-e73e1d2a056a\.user_uploaded\media__1788286698913.jpg"
    DIAGRAM_PATH = r"C:\Users\ravindra_007\.gemini\antigravity\brain\48683922-fa9d-4d33-a4ed-e73e1d2a056a\.user_uploaded\media_1788772298740.jpg"

    # Color Palette: Pure All-White Theme with Crisp Black Borders & Accents
    COLOR_BG = RGBColor(255, 255, 255)         # Pure White Background (#ffffff)
    COLOR_CARD_BG = RGBColor(255, 255, 255)    # Pure White Card Fill (#ffffff)
    COLOR_BORDER = RGBColor(20, 20, 20)        # Crisp Black Border (#141414)
    COLOR_TEXT_BLACK = RGBColor(10, 10, 15)    # Solid Dark Black Text (#0a0a0f)
    COLOR_TEXT_MUTED = RGBColor(80, 80, 95)    # Dark Gray Muted Text (#50505f)

    FONT_HEAD = "Arial"
    FONT_BODY = "Inter"

    def set_white_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = COLOR_BG

    def add_vitap_logo_image(slide, left=0.8, top=0.4, height=0.65):
        if os.path.exists(LOGO_PATH):
            slide.shapes.add_picture(LOGO_PATH, Inches(left), Inches(top), height=Inches(height))
        else:
            tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(2.2), Inches(0.6))
            tf = tb.text_frame
            p = tf.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT
            p.text = "VIT-AP UNIVERSITY"
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = COLOR_TEXT_BLACK

    def add_header(slide, title_text):
        add_vitap_logo_image(slide, left=0.8, top=0.4, height=0.65)

        tb = slide.shapes.add_textbox(Inches(3.8), Inches(0.38), Inches(8.7), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_title = tf.paragraphs[0]
        p_title.alignment = PP_ALIGN.LEFT
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_TEXT_BLACK
        p_title.font.name = FONT_HEAD

    def add_footer(slide, current_num, total_num=15):
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.9), Inches(11.733), Inches(0.01))
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_BORDER
        line.line.fill.background()

        tb = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.733), Inches(0.3))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.LEFT
        p.text = "Cloud-Based AI Software Testing Platform   |   Review 1"
        p.font.size = Pt(9)
        p.font.color.rgb = COLOR_TEXT_MUTED
        p.font.name = FONT_BODY

        p_num = tf.add_paragraph()
        p_num.alignment = PP_ALIGN.RIGHT
        p_num.text = f"{current_num}"
        p_num.font.size = Pt(10)
        p_num.font.bold = True
        p_num.font.color.rgb = COLOR_TEXT_BLACK

    def add_bordered_card(slide, left, top, width, height, title, body_bullets, title_size=14, body_size=11.5):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_BG
        card.line.color.rgb = COLOR_BORDER
        card.line.width = Pt(1.5)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.22)

        if title:
            p = tf.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT
            p.text = title
            p.font.size = Pt(title_size)
            p.font.bold = True
            p.font.color.rgb = COLOR_TEXT_BLACK
            p.font.name = FONT_HEAD
            p.space_after = Pt(6)

        for idx, item in enumerate(body_bullets):
            p = tf.add_paragraph() if (title or idx > 0) else tf.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT
            p.text = item
            p.font.size = Pt(body_size)
            p.font.color.rgb = COLOR_TEXT_MUTED if item.startswith("•") or item.startswith("  ") else COLOR_TEXT_BLACK
            p.font.name = FONT_BODY
            p.space_after = Pt(4)

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_white_background(s1)

    add_vitap_logo_image(s1, left=0.8, top=0.6, height=0.9)

    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(2.2))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    p.text = "CLOUD-BASED AI SOFTWARE"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT_BLACK
    p.font.name = FONT_HEAD

    p2 = tf1.add_paragraph()
    p2.alignment = PP_ALIGN.LEFT
    p2.text = "TESTING PLATFORM"
    p2.font.size = Pt(36)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_BLACK
    p2.font.name = FONT_HEAD
    p2.space_after = Pt(10)

    p3 = tf1.add_paragraph()
    p3.alignment = PP_ALIGN.LEFT
    p3.text = "Cloud Computing — Review 1"
    p3.font.size = Pt(18)
    p3.font.bold = True
    p3.font.color.rgb = COLOR_TEXT_MUTED
    p3.font.name = FONT_BODY

    team_members = [
        "23MIC7176  —  Tarun govardhan",
        "23MIC7202  —  sharan rao",
        "23MIS7297  —  J Ravindra",
        "23MIS7257  —  N Kartheek",
        "23MIS7229  —  Pardhasaradhi M"
    ]

    tb_team = s1.shapes.add_textbox(Inches(0.8), Inches(4.3), Inches(6.5), Inches(2.3))
    tf_t = tb_team.text_frame
    tf_t.word_wrap = True

    for m in team_members:
        p_m = tf_t.add_paragraph() if tf_t.paragraphs[0].text else tf_t.paragraphs[0]
        p_m.alignment = PP_ALIGN.LEFT
        p_m.text = m
        p_m.font.size = Pt(12.5)
        p_m.font.bold = True
        p_m.font.color.rgb = COLOR_TEXT_BLACK
        p_m.space_after = Pt(4)

    tb_g = s1.shapes.add_textbox(Inches(7.5), Inches(5.2), Inches(5.0), Inches(1.0))
    tf_g = tb_g.text_frame
    p_g = tf_g.paragraphs[0]
    p_g.alignment = PP_ALIGN.LEFT
    p_g.text = "Guided by — [Dr. Shaik Kareemulla]"
    p_g.font.size = Pt(14)
    p_g.font.bold = True
    p_g.font.color.rgb = COLOR_TEXT_MUTED

    add_footer(s1, 1)

    # ==========================================
    # SLIDE 2: PROBLEM STATEMENT (MOVED TO SLIDE 2 FIRST)
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_white_background(s2)
    add_header(s2, "PROBLEM STATEMENT")

    add_bordered_card(s2, 0.8, 1.4, 11.733, 1.4, "", [
        "Writing software unit tests manually takes a lot of time, and developers frequently miss hidden bugs and edge cases."
    ], title_size=0, body_size=13.5)

    add_bordered_card(s2, 0.8, 3.0, 11.733, 3.7, "KEY CHALLENGES IN SOFTWARE TESTING", [
        "• Manual Test Writing: Writing unit test cases by hand is slow, repetitive, and time-consuming.",
        "• Missed Bugs & Edge Cases: Important scenarios like null inputs or empty values are easy to forget.",
        "• Machine Differences: Code that works on one laptop can fail on another due to different software setups.",
        "• Confusing Error Messages: Standard build tools show long error logs without explaining how to fix them.",
        "• Computer Slowdowns: Running heavy test suites on personal laptops uses too much memory and CPU."
    ], title_size=15, body_size=12.5)

    add_footer(s2, 2)

    # ==========================================
    # SLIDE 3: INTRODUCTION (SIMPLE & CLEAR)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_white_background(s3)
    add_header(s3, "INTRODUCTION")

    add_bordered_card(s3, 0.8, 1.5, 11.733, 5.1, "", [
        "• Automated AI Platform: A web system that automatically creates and runs unit tests for Java projects.",
        "",
        "• Powered by AI: Uses Artificial Intelligence to read code logic and write complete JUnit test cases.",
        "",
        "• Safe Cloud Execution: Runs tests in isolated cloud containers so your computer stays fast and secure.",
        "",
        "• Simple 4-Step Process: Upload project ZIP -> AI writes tests -> Cloud runs tests -> View results & bug fixes."
    ], title_size=0, body_size=13.5)

    add_footer(s3, 3)

    # ==========================================
    # SLIDE 4: OBJECTIVES (USER FRIENDLY)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_white_background(s4)
    add_header(s4, "OBJECTIVES")

    objs = [
        "• 1. Automatic Test Writing — Use AI to generate unit tests for normal code and tricky edge cases.",
        "• 2. Easy Project Upload — Allow users to drag and drop Java project ZIP files safely.",
        "• 3. Isolated Cloud Running — Execute test suites in temporary cloud containers for consistent results.",
        "• 4. Smart Error Explanations — Explain test failures in plain English and suggest automatic code fixes.",
        "• 5. Live Progress Dashboard — Show real-time test progress, pass/fail totals, and execution logs.",
        "• 6. Secure Cloud Storage — Keep project files, code versions, and test reports safe in cloud databases."
    ]

    add_bordered_card(s4, 0.8, 1.5, 11.733, 5.1, "", objs, title_size=0, body_size=12.5)

    add_footer(s4, 4)

    # ==========================================
    # SLIDE 5: ARCHITECTURAL DIAGRAM (EMBEDDING UPLOADED IMAGE media_1788772298740.jpg)
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_white_background(s5)
    add_header(s5, "ARCHITECTURAL DIAGRAM")

    if os.path.exists(DIAGRAM_PATH):
        s5.shapes.add_picture(DIAGRAM_PATH, Inches(1.4), Inches(1.35), width=Inches(10.533))
    else:
        tb_err = s5.shapes.add_textbox(Inches(0.8), Inches(2.0), Inches(11.733), Inches(3.0))
        p = tb_err.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = "[Architectural Diagram Image]"

    add_footer(s5, 5)

    # ==========================================
    # SLIDE 6: LITERATURE REVIEW
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_white_background(s6)
    add_header(s6, "LITERATURE REVIEW")

    lit_bullets = [
        "KEY AREAS REVIEWED TODAY",
        "",
        "• Traditional Testing Frameworks: Tools like JUnit automate running tests, but humans still write every test case manually.",
        "• AI Code Generation: AI models can write test code, but standard tools don't execute tests in safe sandboxes.",
        "• Container Sandboxes: Isolation tools keep test environments clean, but require complicated manual configuration.",
        "• Cloud Storage & Services: Cloud platforms store files reliably, but lack automated error analysis and fix suggestions.",
        "• Our Proposed Gap Solution: We combine AI test creation + Cloud container execution + Automated error fixes into one website."
    ]

    add_bordered_card(s6, 0.8, 1.5, 11.733, 5.1, "", lit_bullets, title_size=0, body_size=12)

    add_footer(s6, 6)

    # ==========================================
    # SLIDE 7: MODULES — PART 1
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_white_background(s7)
    add_header(s7, "MODULES")

    add_bordered_card(s7, 0.8, 1.5, 11.733, 2.4, "MODULE 1: USER & PROJECT MANAGEMENT", [
        "• User login, developer accounts, and role permissions",
        "• Project ZIP file upload with built-in security checks",
        "• Interactive source code file tree viewer on screen"
    ], title_size=15, body_size=12)

    add_bordered_card(s7, 0.8, 4.1, 11.733, 2.5, "MODULE 2: AI TEST GENERATOR ENGINE", [
        "• Reads Java files, classes, methods, and functions",
        "• Automatically writes test suites for normal logic and edge cases",
        "• Formats generated code into ready-to-run Java test files"
    ], title_size=15, body_size=12)

    add_footer(s7, 7)

    # ==========================================
    # SLIDE 8: MODULES — PART 2
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_white_background(s8)
    add_header(s8, "MODULES")

    add_bordered_card(s8, 0.8, 1.5, 11.733, 2.4, "MODULE 3: CLOUD EXECUTION SANDBOX", [
        "• Starts a fresh, temporary cloud container for each project run",
        "• Executes test builds automatically in isolation",
        "• Prevents test runs from affecting developer laptops or servers"
    ], title_size=15, body_size=12)

    add_bordered_card(s8, 0.8, 4.1, 11.733, 2.5, "MODULE 4: ERROR FIXES & DIAGNOSTICS", [
        "• Captures build failures, compiler errors, and stack traces",
        "• Explains the exact reason why a test failed in plain language",
        "• Provides a one-click button to apply automatic code fixes"
    ], title_size=15, body_size=12)

    add_footer(s8, 8)

    # ==========================================
    # SLIDE 9: MODULES — PART 3
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_white_background(s9)
    add_header(s9, "MODULES")

    add_bordered_card(s9, 0.8, 1.5, 11.733, 2.4, "MODULE 5: LIVE DASHBOARD & ANALYTICS", [
        "• Streams real-time test execution logs directly to the web page",
        "• Displays test pass/fail charts and project health metrics",
        "• Shows side-by-side code diffs comparing broken vs fixed code"
    ], title_size=15, body_size=12)

    add_bordered_card(s9, 0.8, 4.1, 11.733, 2.5, "MODULE 6: CLOUD STORAGE & MONITORING", [
        "• Stores project archives and test reports securely in cloud storage",
        "• Keeps historical logs of past test runs in a central database",
        "• Monitors system speed, uptime, and user data security"
    ], title_size=15, body_size=12)

    add_footer(s9, 9)

    # ==========================================
    # SLIDE 10: CURRENT STATUS — REVIEW 1
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_white_background(s10)
    add_header(s10, "CURRENT STATUS")

    status_bullets = [
        "CURRENT STATUS — REVIEW 1 PROGRESS",
        "",
        "• Finalized project topic, scope, and problem statement",
        "• Identified system objectives and team responsibilities",
        "• Designed complete cloud architecture and data workflow",
        "• Mapped core project modules and feature requirements",
        "• Selected technology stack (React, Spring Boot, AI & AWS Cloud)",
        "• Next Focus: Build backend APIs, database tables, and AI test generation pipeline"
    ]

    add_bordered_card(s10, 0.8, 1.5, 11.733, 5.1, "", status_bullets, title_size=0, body_size=12.5)

    add_footer(s10, 10)

    # ==========================================
    # SLIDE 11: PLAN OF ACTION — PHASES 1 & 2
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    set_white_background(s11)
    add_header(s11, "PLAN OF ACTION")

    add_bordered_card(s11, 0.8, 1.5, 11.733, 2.4, "PHASE 1 — FOUNDATION", [
        "• Set up cloud storage buckets and database tables",
        "• Create user login and dashboard layout design",
        "• Build initial ZIP file upload screens"
    ], title_size=15, body_size=12)

    add_bordered_card(s11, 0.8, 4.1, 11.733, 2.5, "PHASE 2 — CORE BACKEND & AI", [
        "• Build backend server APIs to handle project decompression",
        "• Connect AI model to parse Java files and write unit tests",
        "• Link web dashboard screens to backend services"
    ], title_size=15, body_size=12)

    add_footer(s11, 11)

    # ==========================================
    # SLIDE 12: PLAN OF ACTION — PHASES 3 & 4
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    set_white_background(s12)
    add_header(s12, "PLAN OF ACTION")

    add_bordered_card(s12, 0.8, 1.5, 11.733, 2.4, "PHASE 3 — SANDBOX & DIAGNOSTICS", [
        "• Build the cloud container test runner for clean execution",
        "• Connect error log parser to AI diagnostic engine",
        "• Enable automatic code fix suggestions on the dashboard"
    ], title_size=15, body_size=12)

    add_bordered_card(s12, 0.8, 4.1, 11.733, 2.5, "PHASE 4 — TESTING & DEPLOYMENT", [
        "• Test full workflow with real Java software projects",
        "• Deploy backend and web portal to cloud servers for live access",
        "• Add analytics dashboards and complete final documentation"
    ], title_size=15, body_size=12)

    add_footer(s12, 12)

    # ==========================================
    # SLIDE 13: CONCLUSION
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    set_white_background(s13)
    add_header(s13, "CONCLUSION")

    conc_bullets = [
        "• Provides a complete, automated software testing platform for developers.",
        "",
        "• Saves time by using AI to write unit tests automatically.",
        "",
        "• Keeps code execution consistent by running tests in clean cloud containers.",
        "",
        "• Helps developers fix bugs faster with automated error explanations and code fixes.",
        "",
        "• Delivers a simple, user-friendly web portal for managing software quality."
    ]

    add_bordered_card(s13, 0.8, 1.5, 11.733, 5.1, "", conc_bullets, title_size=0, body_size=13)

    add_footer(s13, 13)

    # ==========================================
    # SLIDE 14: REFERENCES
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    set_white_background(s14)
    add_header(s14, "REFERENCES")

    refs = [
        "• 1. JUnit 5 User Guide & Documentation — https://junit.org/junit5/docs/current/user-guide/",
        "• 2. Spring Boot Framework Reference — https://docs.spring.io/spring-boot/",
        "• 3. AWS Bedrock Foundation Models — https://docs.aws.amazon.com/bedrock/",
        "• 4. AWS ECS Fargate User Guide — https://docs.aws.amazon.com/AmazonECS/",
        "• 5. Docker Container Isolation Overview — https://docs.docker.com/get-started/overview/",
        "• 6. S. Bareiß et al., 'Code Generation Tools in Software Testing: A Survey,' IEEE TSE, 2023."
    ]

    add_bordered_card(s14, 0.8, 1.5, 11.733, 5.1, "", refs, title_size=0, body_size=12.5)

    add_footer(s14, 14)

    # ==========================================
    # SLIDE 15: THANK YOU / Q+A
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    set_white_background(s15)

    add_vitap_logo_image(s15, left=0.8, top=0.6, height=0.9)

    tb15 = s15.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.733), Inches(3.0))
    tf15 = tb15.text_frame
    tf15.word_wrap = True

    p = tf15.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    p.text = "THANK YOU"
    p.font.size = Pt(48)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT_BLACK
    p.font.name = FONT_HEAD
    p.space_after = Pt(10)

    p_sub = tf15.add_paragraph()
    p_sub.alignment = PP_ALIGN.LEFT
    p_sub.text = "Questions and discussion welcome."
    p_sub.font.size = Pt(18)
    p_sub.font.bold = True
    p_sub.font.color.rgb = COLOR_TEXT_MUTED
    p_sub.font.name = FONT_BODY
    p_sub.space_after = Pt(20)

    p_info = tf15.add_paragraph()
    p_info.alignment = PP_ALIGN.LEFT
    p_info.text = "Cloud-Based AI Software Testing Platform — Review 1\nDepartment of Computer Science & Engineering | VIT-AP University"
    p_info.font.size = Pt(13)
    p_info.font.color.rgb = COLOR_TEXT_MUTED

    add_footer(s15, 15)

    output_filename = "Cloud_AI_Testing_Platform_Review_1_VIT_AP_Updated.pptx"
    prs.save(output_filename)
    print(f"VIT-AP Presentation with Custom Diagram generated and saved to: {os.path.abspath(output_filename)}")

if __name__ == "__main__":
    create_vitap_presentation_with_uploaded_diagram()
