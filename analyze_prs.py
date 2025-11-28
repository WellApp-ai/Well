#!/usr/bin/env python3
"""
Script to analyze closed PRs from the last 6 months and aggregate per collaborator per week.
"""

import re
from datetime import datetime
from collections import defaultdict
import subprocess

def get_pr_data():
    """Fetch merged PR data from git log."""
    cmd = ['git', 'log', '--merges', '--since=6 months ago',
           '--pretty=format:%H|%an|%ae|%ad|%s', '--date=iso']
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip().split('\n')

def parse_pr_line(line):
    """Parse a git log line and extract PR information."""
    parts = line.split('|')
    if len(parts) < 5:
        return None

    commit_hash = parts[0]
    author_name = parts[1]
    author_email = parts[2]
    date_str = parts[3]
    commit_msg = parts[4]

    # Extract PR number from commit message
    pr_match = re.search(r'#(\d+)', commit_msg)
    if not pr_match:
        return None

    pr_number = pr_match.group(1)

    # Parse date
    date = datetime.fromisoformat(date_str.split('+')[0].strip())

    # Calculate week number and year
    week_number = date.isocalendar()[1]
    year = date.year
    week_key = f"{year}-W{week_number:02d}"

    return {
        'pr_number': pr_number,
        'author_name': author_name,
        'author_email': author_email,
        'date': date,
        'week': week_key,
        'commit_msg': commit_msg
    }

def aggregate_prs():
    """Aggregate PRs per collaborator per week."""
    lines = get_pr_data()

    # Dictionary to store aggregated data
    # Structure: {week: {collaborator: [pr_numbers]}}
    week_data = defaultdict(lambda: defaultdict(list))

    # Dictionary to store total PRs per collaborator
    collaborator_totals = defaultdict(int)

    for line in lines:
        if not line.strip():
            continue

        pr_info = parse_pr_line(line)
        if pr_info:
            week = pr_info['week']
            collaborator = pr_info['author_name']
            pr_number = pr_info['pr_number']

            week_data[week][collaborator].append(pr_number)
            collaborator_totals[collaborator] += 1

    return week_data, collaborator_totals

def generate_report(week_data, collaborator_totals):
    """Generate a formatted report."""
    report = []
    report.append("=" * 80)
    report.append("PR ANALYSIS REPORT - LAST 6 MONTHS")
    report.append("=" * 80)
    report.append("")

    # Sort weeks in chronological order
    sorted_weeks = sorted(week_data.keys())

    report.append("WEEKLY BREAKDOWN")
    report.append("-" * 80)
    report.append("")

    for week in sorted_weeks:
        report.append(f"Week: {week}")
        collaborators = week_data[week]

        # Sort collaborators by number of PRs in that week (descending)
        sorted_collaborators = sorted(
            collaborators.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )

        for collaborator, pr_numbers in sorted_collaborators:
            pr_count = len(pr_numbers)
            pr_list = ', '.join(f"#{pr}" for pr in sorted(pr_numbers, key=int))
            report.append(f"  {collaborator}: {pr_count} PR(s) - {pr_list}")

        report.append("")

    report.append("=" * 80)
    report.append("TOTAL PRS PER COLLABORATOR")
    report.append("-" * 80)
    report.append("")

    # Sort collaborators by total PRs (descending)
    sorted_totals = sorted(
        collaborator_totals.items(),
        key=lambda x: x[1],
        reverse=True
    )

    for collaborator, count in sorted_totals:
        report.append(f"{collaborator}: {count} PR(s)")

    report.append("")
    report.append("=" * 80)

    total_prs = sum(collaborator_totals.values())
    total_collaborators = len(collaborator_totals)
    report.append(f"SUMMARY: {total_prs} PRs merged by {total_collaborators} collaborators")
    report.append("=" * 80)

    return '\n'.join(report)

def main():
    """Main function."""
    week_data, collaborator_totals = aggregate_prs()
    report = generate_report(week_data, collaborator_totals)

    # Print to console
    print(report)

    # Save to file
    with open('pr_analysis_report.txt', 'w') as f:
        f.write(report)

    print("\n\nReport saved to: pr_analysis_report.txt")

if __name__ == '__main__':
    main()
